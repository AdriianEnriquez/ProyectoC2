package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
)

type TokenType string
type Token struct {
	Type  TokenType `json:"type"`
	Value string    `json:"value"`
}
type LogEntry struct {
	SourceIP string
	IsError  bool
}
type LexicalResult struct {
	LineNumber int     `json:"lineNumber"`
	RawLine    string  `json:"rawLine"`
	Tokens     []Token `json:"tokens"`
}
type SyntacticResult struct {
	LineNumber int    `json:"lineNumber"`
	Status     string `json:"status"`
	Reason     string `json:"reason,omitempty"`
}
type StructuralFinding struct {
	LineNumber   int    `json:"lineNumber"`
	Message      string `json:"message"`
	InvalidValue string `json:"invalidValue"`
}
type LogAlert struct {
	ID       string `json:"id"`
	Severity string `json:"severity"`
	Type     string `json:"type"`
	Details  string `json:"details"`
	IP       string `json:"ip_address,omitempty"`
}
type AnalysisSummary struct {
	LinesProcessed int `json:"linesProcessed"`
	AlertsFound    int `json:"alertsFound"`
}
type LogAnalysisResponse struct {
	Status             string              `json:"status"`
	Summary            AnalysisSummary     `json:"summary"`
	LexicalAnalysis    []LexicalResult     `json:"lexicalAnalysis"`
	SyntacticAnalysis  []SyntacticResult   `json:"syntacticAnalysis"`
	StructuralAnalysis []StructuralFinding `json:"structuralAnalysis,omitempty"`
	SemanticAnalysis   []LogAlert          `json:"semanticAnalysis"`
}

const (
	KEYWORD   TokenType = "KEYWORD"
	IP        TokenType = "IP"
	TIMESTAMP TokenType = "TIMESTAMP"
	PROCESS   TokenType = "PROCESS"
	PID       TokenType = "PID"
	HOSTNAME  TokenType = "HOSTNAME"
	USER      TokenType = "USER"
	SEPARATOR TokenType = "SEPARATOR"
	UNKNOWN   TokenType = "UNKNOWN"
)

type tokenDefinition struct {
	Type  TokenType
	Regex *regexp.Regexp
}

var tokenDefinitions = []tokenDefinition{
	{TIMESTAMP, regexp.MustCompile(`^[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}`)},
	{IP, regexp.MustCompile(`^\d{1,3}(\.\d{1,3}){1,}`)},
	{PID, regexp.MustCompile(`^\[\d+\]:`)},
	{KEYWORD, regexp.MustCompile(`^(?i)(Failed|password|for|from|user|invalid|port|ssh2|Accepted)`)},
	{PROCESS, regexp.MustCompile(`^sshd`)},
	{HOSTNAME, regexp.MustCompile(`^[a-zA-Z0-9\-\_]+`)},
	{USER, regexp.MustCompile(`^[a-zA-Z0-9\-\_]+`)},
	{SEPARATOR, regexp.MustCompile(`^:`)},
}

func lexerForLogs(line string) []Token {
	var tokens []Token
	remainingLine := strings.TrimSpace(line)
	for len(remainingLine) > 0 {
		foundMatch := false
		for _, def := range tokenDefinitions {
			match := def.Regex.FindString(remainingLine)
			if len(match) > 0 {
				value := strings.Trim(match, "[]:")
				tokens = append(tokens, Token{Type: def.Type, Value: value})
				remainingLine = strings.TrimSpace(remainingLine[len(match):])
				foundMatch = true
				break
			}
		}
		if !foundMatch {
			parts := strings.Fields(remainingLine)
			if len(parts) > 0 {
				tokens = append(tokens, Token{Type: UNKNOWN, Value: parts[0]})
				remainingLine = strings.TrimSpace(remainingLine[len(parts[0]):])
			} else {
				break
			}
		}
	}
	return tokens
}

func validateIPAddress(ip string) bool {
	parts := strings.Split(ip, ".")
	if len(parts) != 4 {
		return false
	}
	for _, part := range parts {
		num, err := strconv.Atoi(part)
		if err != nil {
			return false
		}
		if num < 0 || num > 255 {
			return false
		}
	}
	return true
}

func parseLogLine(tokens []Token) *LogEntry {
	failedIndex, fromIndex := -1, -1
	for i, token := range tokens {
		if token.Type == KEYWORD && strings.EqualFold(token.Value, "Failed") {
			failedIndex = i
		}
		if token.Type == KEYWORD && strings.EqualFold(token.Value, "from") {
			fromIndex = i
		}
	}
	if failedIndex != -1 && fromIndex != -1 && fromIndex > failedIndex {
		entry := &LogEntry{IsError: true}
		if len(tokens) > fromIndex+1 && tokens[fromIndex+1].Type == IP {
			ipCandidate := tokens[fromIndex+1].Value
			if validateIPAddress(ipCandidate) {
				entry.SourceIP = ipCandidate
			}
		}
		return entry
	}
	return nil
}

func analyzeLogsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var logContent []byte
	var err error

	contentType := r.Header.Get("Content-Type")
	if strings.Contains(contentType, "multipart/form-data") {
		if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB limit
			http.Error(w, "Error procesando el archivo subido", http.StatusBadRequest)
			return
		}
		file, _, err := r.FormFile("logFile")
		if err != nil {
			http.Error(w, "Error obteniendo el archivo del formulario", http.StatusBadRequest)
			return
		}
		defer file.Close()
		logContent, err = io.ReadAll(file)
		if err != nil {
			http.Error(w, "Error leyendo el contenido del archivo", http.StatusInternalServerError)
			return
		}
	} else {
		logContent, err = io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error leyendo petición", http.StatusBadRequest)
			return
		}
		defer r.Body.Close()
	}

	lines := strings.Split(string(logContent), "\n")
	var lexicalResults []LexicalResult
	var syntacticResults []SyntacticResult
	var semanticEntries []*LogEntry
	var structuralFindings []StructuralFinding

	for i, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}
		lineNumber := i + 1
		tokens := lexerForLogs(line)
		lexicalResults = append(lexicalResults, LexicalResult{LineNumber: lineNumber, RawLine: line, Tokens: tokens})

		for _, token := range tokens {
			if token.Type == IP {
				if !validateIPAddress(token.Value) {
					finding := StructuralFinding{
						LineNumber:   lineNumber,
						Message:      fmt.Sprintf("La dirección IP '%s' tiene un formato inválido.", token.Value),
						InvalidValue: token.Value,
					}
					structuralFindings = append(structuralFindings, finding)
				}
			}
		}

		entry := parseLogLine(tokens)
		if entry != nil {
			syntacticResults = append(syntacticResults, SyntacticResult{LineNumber: lineNumber, Status: "ÉXITO", Reason: "La línea coincide con un patrón de error de login."})
			semanticEntries = append(semanticEntries, entry)
		} else {
			syntacticResults = append(syntacticResults, SyntacticResult{LineNumber: lineNumber, Status: "FALLO", Reason: "Estructura no reconocida."})
		}
	}

	ipFailureCount := make(map[string]int)
	for _, entry := range semanticEntries {
		if entry.IsError && entry.SourceIP != "" {
			ipFailureCount[entry.SourceIP]++
		}
	}
	var alerts []LogAlert
	const bruteForceThreshold = 5
	for ip, count := range ipFailureCount {
		if count >= bruteForceThreshold {
			alerts = append(alerts, LogAlert{ID: "brute-force-" + ip, Severity: "ALTA", Type: "Fuerza Bruta", Details: fmt.Sprintf("Se detectaron %d intentos de login fallidos desde la misma IP.", count), IP: ip})
		}
	}

	response := LogAnalysisResponse{
		Status:             "success",
		Summary:            AnalysisSummary{LinesProcessed: len(lines), AlertsFound: len(alerts)},
		LexicalAnalysis:    lexicalResults,
		SyntacticAnalysis:  syntacticResults,
		StructuralAnalysis: structuralFindings,
		SemanticAnalysis:   alerts,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	log.Println("Análisis de logs completo y reporte detallado enviado.")
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/analyze-logs", analyzeLogsHandler)
	mux.HandleFunc("/api/analyze-grammar", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(make([]interface{}, 0))
	})

	handler := corsMiddleware(mux)

	log.Println("Servidor de análisis REAL iniciado en http://localhost:8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatalf("Error al iniciar el servidor: %v", err)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
