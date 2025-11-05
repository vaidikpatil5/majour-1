import gradio as gr
from dotenv import load_dotenv
from rag_llm_documind import setup_rag, answer_query, initialize_models

load_dotenv()
initialize_models()

def process_pdfs_and_query(pdfs, query):
    if not pdfs:
        return "Please upload at least one PDF.", []

    # With type="filepath", Gradio passes file paths (strings)
    pdf_paths = pdfs
    setup_rag(pdf_paths)

    answer = answer_query(query)
    return answer["answer"], answer["sources"]

iface = gr.Interface(
    fn=process_pdfs_and_query,
    inputs=[
        gr.File(label="Upload PDFs", type="filepath", file_count="multiple"),
        gr.Textbox(label="Query")
    ],
    outputs=[
        gr.Textbox(label="Answer"),
        gr.JSON(label="Sources")
    ],
    title="DocuMind",
    description="Upload PDFs and ask questions about their content.",
)

if __name__ == "__main__":
    iface.launch(server_name="127.0.0.1", server_port=7860, show_error=True)
    print("App running at http://127.0.0.1:7860/")