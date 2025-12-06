from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from llm import query_processor
from werkzeug.utils import secure_filename
import tempfile
import os


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)

    @app.route("/", methods=('GET',))
    def index_page():
        return render_template("index_page.html"), 200

    @app.errorhandler(404)
    def page_not_found(e):
        return render_template("page_not_found.html"), 404

    @app.route("/query_page", methods=('GET',))
    def query_page():
        return render_template("query_page.html"), 200

    @app.route("/response_page", methods=('POST',))
    def response_page():
        form = request.form
        files = request.files
        file_data = {}  # key: filename, value: text content of the file.
        temp_files = []  # To keep track of temp files for cleanup

        try:
            # Extracting text from files into file_data
            for file in request.files.getlist("files"):
                filename = secure_filename(file.filename)
                if filename != '':  # i.e. if file not empty
                    # Save file to temp location for processing
                    temp_fd, temp_path = tempfile.mkstemp()
                    os.close(temp_fd)  # Close the file descriptor
                    file.save(temp_path)
                    temp_files.append(temp_path)

                    # Determine file type and extract text
                    if file.mimetype in ['text/plain', 'text/markdown']:
                        with open(temp_path, 'r', encoding='utf-8') as f:
                            file_data[filename] = f.read()
                    elif file.mimetype == 'application/pdf':
                        import fitz
                        doc = fitz.open(temp_path)
                        text = ""
                        for page in doc:
                            text += '\n' + page.get_text()
                        file_data[filename] = text
                    else:
                        return f"Unsupported filetype {file.mimetype} submitted.", 400

            resp_data = query_processor(file_data, request.form['query_box'])

            # Rendering the template and returning the response
            # if correct form submitted.
            if 'query_submission' in form:
                if 'application/json' in request.headers.get('Accept', '').lower():
                    return jsonify({"query": form["query_box"], "response": resp_data.get("text"), "sources": resp_data.get("sources", [])}), 200
                else:
                    return render_template(
                        "response_page.html",
                        query=form["query_box"],
                        response=resp_data.get("text")
                    ), 200
            else:
                if 'application/json' in request.headers.get('Accept', '').lower():
                    return jsonify({"error": "Unknown form POSTed to response_page."}), 400
                else:
                    return "Unknown form POSTed to response_page.", 400

        except Exception as e:
            if 'application/json' in request.headers.get('Accept', '').lower():
                return jsonify({"error": f"An error occurred: {str(e)}"}), 500
            else:
                return f"An error occurred: {str(e)}", 500

        finally:
            # Cleanup temp files
            for temp_path in temp_files:
                try:
                    os.remove(temp_path)
                except OSError:
                    pass  # Ignore if file already deleted or inaccessible

    @app.route("/gradio", methods=('GET',))
    def gradio_interface():
        def process_pdfs_and_query(pdfs, query):
            if not pdfs:
                return "Please upload at least one PDF.", []

            file_data = {}
            for pdf in pdfs:
                filename = secure_filename(pdf.name)
                import fitz
                doc = fitz.open(stream=pdf.read())
                text = ""
                for page in doc:
                    text += '\n' + page.get_text()
                file_data[filename] = text

            answer = query_processor(file_data, query)
            return answer, []  # No sources in this simple version

        iface = gr.Interface(
            fn=process_pdfs_and_query,
            inputs=[
                gr.File(label="Upload PDFs", type="binary", file_count="multiple"),
                gr.Textbox(label="Query")
            ],
            outputs=[
                gr.Textbox(label="Answer"),
                gr.JSON(label="Sources")
            ],
            title="DocuMind  Gradio Interface",
            description="Upload PDFs and ask questions about their content.",
        )
        return iface.launch(share=False, server_name="127.0.0.1", server_port=7860, inline=True)

    return app
