package main

import (
	"fmt"
	"html/template"
	"net/http"
	"os"
	"strings"
)

type pageData struct {
	Text, Banner, Header, Result, Error string
}

func main() {
	http.HandleFunc("/", homepage)
	fmt.Println("Server has started")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("Server error:", err)
	}
}

func homepage(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.Error(w, "404 ERROR - Page Not Found", 404)
		return
	}

	temp, err := template.ParseFiles("index.html")
	if err != nil {
		http.Error(w, "500 Error - Internal Server Error", 500)
		return
	}

	if r.Method == http.MethodGet {
		temp.Execute(w, pageData{Header: "Ascii Art Generator"})
		return
	}

	if err := r.ParseForm(); err != nil {
		http.Error(w, "400 Error - Bad Request", 400)
		return
	}

	text := r.FormValue("Text")
	banner := r.FormValue("Banner")

	if text == "" {
		w.WriteHeader(http.StatusBadRequest)
		temp.Execute(w, pageData{
			Header: "Ascii Art Generator",
			Banner: banner,
			Error:  "Field cannot be empty",
		})
		return
	}
	
	allowed := map[string]bool{"standard": true, "shadow": true, "thinkertoy": true}
	if !allowed[banner] {
		w.WriteHeader(http.StatusBadRequest)
		temp.Execute(w, pageData{
			Header: "Ascii Art Generator",
			Text:   text,
			Error:  "Invalid banner selected",
		})
		return
	}

	result := makeASCIIArt(text, banner)

	if result == "err_file" {
		http.Error(w, "500 Error - Internal Server Error", 500)
		return
	}

	if result == "Non-Ascii" {
		w.WriteHeader(http.StatusBadRequest)
		temp.Execute(w, pageData{
			Header: "Ascii Art Generator",
			Text:   text,
			Banner: banner,
			Error:  "Non-ASCII character detected, please check and correct your input",
		})
		return
	}

	temp.Execute(w, pageData{
		Header: "Ascii Art Generator",
		Text:   text,
		Banner: banner,
		Result: result,
	})
}

func makeASCIIArt(txt, ban string) string {
    var result strings.Builder

    bannerBytes, err := os.ReadFile(ban + ".txt")
    if err != nil {
        return "err_file"
    }

    cleaned := strings.ReplaceAll(string(bannerBytes), "\r\n", "\n")
    bannerLines := strings.Split(cleaned, "\n")
    txt = strings.ReplaceAll(txt, "\r\n", "\n") 
    txt = strings.ReplaceAll(txt, "\\n", "\n") 
    txtLines := strings.Split(txt, "\n")

    for _, line := range txtLines {
        if line == "" {
            result.WriteString("\n")
            continue
        }
        for rows := 1; rows <= 8; rows++ {
            for _, char := range line {
                if char < 32 || char > 126 {
                    return "Non-Ascii"
                }
                start := int(char-32) * 9
                if start+rows >= len(bannerLines) {
                    return "err_file"
                }
                result.WriteString(bannerLines[start+rows])
            }
            result.WriteString("\n")
        }
    }

    return result.String()
}