import prov.model as prov
import random
import string
import sys

document = prov.ProvDocument()
text = sys.argv[1]
document = prov.ProvDocument.deserialize(document, text)
documentProVN = document.get_provn()
print(documentProVN)
