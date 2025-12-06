import fitz

def text_from_pdf(pdf_file_pointer)->str:
    '''
        Takes a pdf file as input.
        Returns a string containing
        the text content extracted from the pdf.
    '''
    doc = fitz.open(stream=pdf_file_pointer.read())
    text = ""
    for page in doc:
        text += '\n'
        text += page.get_text()
        
    return text