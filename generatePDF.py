import prov.model as prov
from prov.dot import prov_to_dot
import shutil
import random
import string
import sys

letters = string.ascii_lowercase
file_name = ''.join(random.choice(letters) for i in range(10)) + ".pdf"
document = prov.ProvDocument()
text = sys.argv[1]
document = prov.ProvDocument.deserialize(document, text)
dot = prov_to_dot(document)
dot.write_pdf(file_name)
print(file_name)

