import sys
import os
import json
import google.generativeai as genai
from pypdf import PdfReader

def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def chunk_text(text, chunk_size=30000):
    """Chunks text to fit within context window, respecting sentence boundaries if possible."""
    chunks = []
    current_chunk = ""
    
    sentences = text.split('. ')
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) < chunk_size:
            current_chunk += sentence + ". "
        else:
            chunks.append(current_chunk)
            current_chunk = sentence + ". "
    
    if current_chunk:
        chunks.append(current_chunk)
        
    return chunks

def process_with_gemini(text_chunks, prompt, api_key):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
    
    results = []
    
    for i, chunk in enumerate(text_chunks):
        try:
            # Construct a prompt that asks for JSON output
            full_prompt = f"""
            You are a helpful assistant that extracts information from text.
            
            USER INSTRUCTION: {prompt}
            
            DATA TO PROCESS (Chunk {i+1}/{len(text_chunks)}):
            {chunk}
            
            OUTPUT FORMAT:
            Please provide the output in valid JSON format. 
            If the user asked for a list, return a JSON object with a key "items" containing the list.
            Do not include markdown formatting (like ```json). Just return the raw JSON string.
            """
            
            response = model.generate_content(full_prompt)
            results.append(response.text)
            
        except Exception as e:
            print(f"Error processing chunk {i}: {e}", file=sys.stderr)
            results.append(json.dumps({"error": str(e)}))

    return results

def merge_results(results):
    """
    Attempts to merge JSON results. 
    If they are lists, extends them. 
    If they are objects, updates them.
    Otherwise, returns a list of strings.
    """
    merged_data = []
    is_list = False
    
    try:
        # Try to parse first result to see structure
        first = json.loads(results[0])
        if isinstance(first, list):
            merged_data = []
            is_list = True
        elif isinstance(first, dict):
            merged_data = {}
            is_list = False
        else:
            return results # Return as raw strings if not json structure
            
        for res in results:
            try:
                data = json.loads(res)
                if is_list and isinstance(data, list):
                    merged_data.extend(data)
                elif not is_list and isinstance(data, dict):
                    # For dicts, we might need a smarter merge strategy depending on keys
                    # For now, let's just update, but this might overwrite. 
                    # Better strategy: if keys match and are lists, extend.
                    for k, v in data.items():
                        if k in merged_data:
                            if isinstance(merged_data[k], list) and isinstance(v, list):
                                merged_data[k].extend(v)
                            else:
                                merged_data[k] = v # Overwrite
                        else:
                            merged_data[k] = v
            except:
                pass
                
        return json.dumps(merged_data, indent=2)
        
    except:
        # Fallback: just join with newlines
        return "\n\n".join(results)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_pdf.py <pdf_path> <prompt> <api_key>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    prompt = sys.argv[2]
    api_key = sys.argv[3]

    if not os.path.exists(pdf_path):
        print(f"Error: File not found at {pdf_path}")
        sys.exit(1)

    try:
        # 1. Extract Text
        text = extract_text_from_pdf(pdf_path)
        
        # 2. Chunk Text (Gemini Pro has 32k token limit, approx 120k chars. Safe side 30k chars)
        chunks = chunk_text(text)
        
        # 3. Process with Gemini
        results = process_with_gemini(chunks, prompt, api_key)
        
        # 4. Merge and Print
        final_output = merge_results(results)
        print(final_output)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
