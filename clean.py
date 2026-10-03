import re

file_path = 'c:/Users/Soni Tiwari/Desktop/ACS PROJECT/Latest_erp_globl/Admin_Software/src/pages/suppliers/SupplierForm.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Basic & Tax - Remove Legal Name, Alternate Mobile, Website
content = re.sub(r'<div[^>]*>\s*<label[^>]*>Legal Name.*?</label>\s*<input[^>]*legalName.*?</div\s*>', '', content, flags=re.DOTALL)
content = re.sub(r'<div[^>]*>\s*<label[^>]*>Alternate Mobile.*?</label>\s*<input[^>]*alternateMobile.*?</div\s*>', '', content, flags=re.DOTALL)
content = re.sub(r'<div[^>]*>\s*<label[^>]*>Website.*?</label>\s*<input[^>]*website.*?</div\s*>', '', content, flags=re.DOTALL)

# 1b. Tax - Remove TAN, MSME, HSN, TDS Section, Place of Supply
content = re.sub(r'<div[^>]*>\s*<label[^>]*>TAN Number.*?</label>\s*<input[^>]*tan.*?</div\s*>', '', content, flags=re.DOTALL)
content = re.sub(r'<div[^>]*>\s*<label[^>]*>MSME / Udyam No.*?</label>\s*<input[^>]*msme.*?</div\s*>', '', content, flags=re.DOTALL)
content = re.sub(r'<div[^>]*>\s*<label[^>]*>HSN Code.*?</label>\s*<input[^>]*hsn.*?</div\s*>', '', content, flags=re.DOTALL)
content = re.sub(r'\{supplierForm\.tdsApplicable && \(\s*<div[^>]*>\s*<label[^>]*>TDS Section.*?</label>\s*<input[^>]*tdsSection.*?</div\s*>\s*\)\}', '', content, flags=re.DOTALL)
content = re.sub(r'<div[^>]*>\s*<label[^>]*>Place of Supply.*?</label>\s*<input[^>]*placeOfSupply.*?</div\s*>', '', content, flags=re.DOTALL)

# Remove contacts functions
content = re.sub(r'const addContact = \(\) => \{.*?\};', '', content, flags=re.DOTALL)
content = re.sub(r'const removeContact = \(index\) => \{.*?\};', '', content, flags=re.DOTALL)
content = re.sub(r'const addProduct = \(\) => \{.*?\};', '', content, flags=re.DOTALL)
content = re.sub(r'const removeProduct = \(index\) => \{.*?\};', '', content, flags=re.DOTALL)

# Rename tabs
content = content.replace("id: 'contacts', label: 'Contacts & Bank', icon: Users", "id: 'bank', label: 'Bank Details', icon: CreditCard")
content = content.replace("id: 'products', label: 'Products & Docs', icon: Package", "id: 'documents', label: 'Documents', icon: FileText")
content = re.sub(r'\{ id: \'performance\', label: \'Performance\', icon: Star \},?\s*', '', content)

# 3. Contacts & Bank - Remove Extra Contacts section
content = re.sub(r'\{/\* Extra Contact Persons \*/\}.*?\{/\* Multiple Bank Accounts \*/\}', '{/* Multiple Bank Accounts */}', content, flags=re.DOTALL)

# Bank details - Remove Account Type, Branch Name, UPI ID
content = re.sub(r'<div[^>]*>\s*<label[^>]*>Account Type.*?</label>\s*<select[^>]*bank\.type.*?</select>\s*</div\s*>', '', content, flags=re.DOTALL)
content = re.sub(r'<div[^>]*>\s*<label[^>]*>Branch Name.*?</label>\s*<input[^>]*bank\.branch.*?</div\s*>', '', content, flags=re.DOTALL)
content = re.sub(r'<div[^>]*>\s*<label[^>]*>UPI ID.*?</label>\s*<input[^>]*bank\.upi.*?</div\s*>', '', content, flags=re.DOTALL)
content = content.replace('md:grid-cols-4', 'md:grid-cols-2')

# 4. Commercials - Remove fields
content = re.sub(r'<div[^>]*>\s*<label[^>]*>Default Warehouse.*?</label>\s*<select[^>]*defaultWarehouse.*?</select>\s*</div\s*>', '', content, flags=re.DOTALL)
content = re.sub(r'<div[^>]*>\s*<label[^>]*>Delivery Terms.*?</label>\s*<input[^>]*deliveryTerms.*?</div\s*>', '', content, flags=re.DOTALL)
content = re.sub(r'<div[^>]*>\s*<label[^>]*>Freight Terms.*?</label>\s*<select[^>]*freightTerms.*?</select>\s*</div\s*>', '', content, flags=re.DOTALL)
content = re.sub(r'<div[^>]*>\s*<label[^>]*>Lead Time \(Days\).*?</label>\s*<input[^>]*leadTime.*?</div\s*>', '', content, flags=re.DOTALL)
content = re.sub(r'<div[^>]*>\s*<label[^>]*>Minimum Order Qty.*?</label>\s*<input[^>]*moq.*?</div\s*>', '', content, flags=re.DOTALL)
content = re.sub(r'<div[^>]*>\s*<label[^>]*>Price Validity.*?</label>\s*<input[^>]*priceValidity.*?</div\s*>', '', content, flags=re.DOTALL)
content = re.sub(r'<div[^>]*>\s*<label[^>]*>Purchase Representative.*?</label>\s*<input[^>]*purchaseRep.*?</div\s*>', '', content, flags=re.DOTALL)

# 5. Products & Docs
# Remove supplier products section
content = re.sub(r'\{/\* Supplier Products \*/\}.*?\{/\* Documents Upload \*/\}', '{/* Documents Upload */}', content, flags=re.DOTALL)
# Update documents array mapping
content = re.sub(r'\{\s*label:\s*\'MSME Certificate\',\s*field:\s*\'msmeCert\'\s*\},', '', content)
content = re.sub(r'\{\s*label:\s*\'Company Reg\.\',\s*field:\s*\'companyCert\'\s*\},', '', content)
content = re.sub(r'\{\s*label:\s*\'Agreement\',\s*field:\s*\'agreement\'\s*\},', '', content)

# 6. Remove Performance Tab
content = re.sub(r'\{activeFormTab === \'performance\' && \(.*?\}\)\s*\}\s*</form>', '</form>', content, flags=re.DOTALL)

# Fix activeFormTab strings
content = content.replace("activeFormTab === 'contacts'", "activeFormTab === 'bank'")
content = content.replace("activeFormTab === 'products'", "activeFormTab === 'documents'")
content = content.replace("const tabs = ['basic', 'address', 'contacts', 'commercial', 'products', 'performance'];", "const tabs = ['basic', 'address', 'bank', 'commercial', 'documents'];")
content = content.replace("activeFormTab === 'performance' ?", "activeFormTab === 'documents' ?")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully.')
