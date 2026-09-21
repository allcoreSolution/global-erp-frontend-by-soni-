import React, { useState } from 'react';
import {
  User, MapPin, CreditCard, DollarSign, FileText, ShieldCheck,
  Plus, X, Box, Star, Trash2, Building, ArrowLeft, Check
} from 'lucide-react';
import api from '../../api';

export const initialFormState = {
  id: '',
  type: 'Manufacturer',
  companyName: '',
  legalName: '',
  contactPerson: '',
  phone: '',
  alternateMobile: '',
  email: '',
  website: '',
  category: 'Raw Materials',
  status: true,
  
  gstStatus: 'Registered',
  gstin: '',
  pan: '',
  tan: '',
  msme: '',
  taxPreference: 'Taxable',
  tdsApplicable: false,
  tdsSection: '',
  placeOfSupply: '',
  
  billingAddress: { street1: '', street2: '', country: '', state: '', city: '', zip: '' },
  shippingAddress: { street1: '', street2: '', country: '', state: '', city: '', zip: '' },
  
  contacts: [], 
  banks: [], 
  
  paymentTerms: 'Net 30',
  creditLimit: 0,
  currency: 'INR',
  purchasePriceList: '',
  defaultWarehouse: '',
  deliveryTerms: '',
  freightTerms: '',
  leadTime: 0,
  moq: 0,
  discount: 0,
  additionalDiscount: 0,
  priceValidity: '',
  purchaseRep: '',
  
  products: [], 
  
  documents: {
    gstCert: null, panCard: null, msmeCert: null, cheque: null, companyCert: null, agreement: null, other: null
  },
  
  performance: {
    supplierRating: 0, qualityRating: 0, deliveryRating: 0,
    onTimeDelivery: 0, rejectionPercent: 0, avgDeliveryTime: 0,
    totalPurchase: 0, outstandingAmount: 0, lastPurchaseDate: ''
  }
};

const SupplierForm = ({ initialData, isEditMode, onSubmit, onCancel }) => {
  const [supplierTypes, setSupplierTypes] = useState(['Manufacturer', 'Distributor', 'Wholesaler', 'Service Provider', 'Importer', 'Local Supplier']);
  const [supplierCategories, setSupplierCategories] = useState(['Raw Materials', 'Packaging', 'Logistics', 'IT Services']);
  const [paymentTermsList, setPaymentTermsList] = useState(['Advance', 'Due on Receipt', 'Net 7', 'Net 15', 'Net 30', 'Net 45', 'Net 60']);
  const [currencyList, setCurrencyList] = useState(['INR', 'USD', 'EUR']);
  const [taxPrefs, setTaxPrefs] = useState(['Taxable', 'Exempt', 'Non-Taxable']);

  const [addOption, setAddOption] = useState({ isOpen: false, targetField: '', title: '', value: '' });

  const [supplierForm, setSupplierForm] = useState(initialData || initialFormState);
  
  const [copyAddress, setCopyAddress] = useState(initialData ? JSON.stringify(initialData.billingAddress) === JSON.stringify(initialData.shippingAddress) : false);
  const [activeFormTab, setActiveFormTab] = useState('basic');

  const handleFileUpload = async (e, docField) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setSupplierForm(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [docField]: response.data.url
          }
        }));
        alert(`${docField} uploaded successfully!`);
      }
    } catch (error) {
      console.error(`Error uploading ${docField}:`, error);
      alert('Upload failed. Please check server logs.');
    }
  };

  const handleCopyAddress = (e) => {
    const checked = e.target.checked;
    setCopyAddress(checked);
    if (checked) {
      setSupplierForm(prev => ({
        ...prev,
        shippingAddress: { ...prev.billingAddress }
      }));
    }
  };

  const handleAddOptionSubmit = () => {
    if (!addOption.value.trim()) return;
    const val = addOption.value.trim();
    if (addOption.targetField === 'type') {
      setSupplierTypes(prev => [...prev, val]);
      setSupplierForm(prev => ({ ...prev, type: val }));
    } else if (addOption.targetField === 'category') {
      setSupplierCategories(prev => [...prev, val]);
      setSupplierForm(prev => ({ ...prev, category: val }));
    } else if (addOption.targetField === 'paymentTerms') {
      setPaymentTermsList(prev => [...prev, val]);
      setSupplierForm(prev => ({ ...prev, paymentTerms: val }));
    } else if (addOption.targetField === 'currency') {
      setCurrencyList(prev => [...prev, val]);
      setSupplierForm(prev => ({ ...prev, currency: val }));
    }
    setAddOption({ isOpen: false, targetField: '', title: '', value: '' });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!supplierForm.companyName.trim()) return;
    onSubmit(supplierForm);
  };

  const addContact = () => setSupplierForm(prev => ({ ...prev, contacts: [...prev.contacts, { name: '', designation: '', mobile: '', email: '', department: '' }] }));
  const removeContact = (idx) => setSupplierForm(prev => ({ ...prev, contacts: prev.contacts.filter((_, i) => i !== idx) }));
  
  const addBank = () => setSupplierForm(prev => ({ ...prev, banks: [...prev.banks, { holderName: '', bankName: '', accountNumber: '', ifsc: '', branch: '', type: 'Current', upi: '', address: '' }] }));
  const removeBank = (idx) => setSupplierForm(prev => ({ ...prev, banks: prev.banks.filter((_, i) => i !== idx) }));

  const addProduct = () => setSupplierForm(prev => ({ ...prev, products: [...prev.products, { product: '', sku: '', purchasePrice: 0, tax: 0, moq: 0, leadTime: 0 }] }));
  const removeProduct = (idx) => setSupplierForm(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== idx) }));

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col h-full min-h-[80vh]">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center rounded-t-xl">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-xl text-slate-800">{isEditMode ? `Edit Supplier (${supplierForm.id})` : 'Add New Supplier'}</h2>
            <p className="text-xs text-slate-500 mt-1">Fill in the details below to complete the supplier registration.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 border-b border-slate-200 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar">
        {[
          { id: 'basic', label: 'Basic & Tax', icon: User },
          { id: 'address', label: 'Addresses', icon: MapPin },
          { id: 'contacts', label: 'Contacts & Bank', icon: CreditCard },
          { id: 'commercial', label: 'Commercials', icon: DollarSign },
          { id: 'products', label: 'Products & Docs', icon: FileText },
          { id: 'performance', label: 'Performance', icon: ShieldCheck }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFormTab(tab.id)}
            className={`flex items-center gap-1.5 py-3 px-5 border-b-2 whitespace-nowrap transition-colors ${
              activeFormTab === tab.id ? 'border-blue-600 text-indigo-600 bg-white' : 'border-transparent text-gray-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs sm:text-sm">
      
        {activeFormTab === 'basic' && (
          <div className="space-y-8">
            {/* Basic Info */}
            <div>
              <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2"><User size={16}/> Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Supplier Code *</label>
                  <input type="text" disabled value={supplierForm.id} className="w-full border border-slate-300 rounded p-2 bg-slate-100 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Supplier / Company Name *</label>
                  <input type="text" required value={supplierForm.companyName} onChange={(e) => setSupplierForm({ ...supplierForm, companyName: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Legal Name</label>
                  <input type="text" value={supplierForm.legalName} onChange={(e) => setSupplierForm({ ...supplierForm, legalName: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
                </div>
                
                {/* Dynamic Dropdown for Type */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Supplier Type</label>
                  <div className="flex gap-1">
                    <select value={supplierForm.type} onChange={(e) => setSupplierForm({ ...supplierForm, type: e.target.value })} className="flex-1 border border-slate-300 rounded p-2 bg-white">
                      {supplierTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button type="button" onClick={() => setAddOption({ isOpen: true, targetField: 'type', title: 'Add Supplier Type', value: '' })} className="bg-slate-100 border border-slate-300 px-2 rounded hover:bg-slate-200"><Plus size={14}/></button>
                  </div>
                </div>

                {/* Dynamic Dropdown for Category */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Supplier Category</label>
                  <div className="flex gap-1">
                    <select value={supplierForm.category} onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })} className="flex-1 border border-slate-300 rounded p-2 bg-white">
                      {supplierCategories.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button type="button" onClick={() => setAddOption({ isOpen: true, targetField: 'category', title: 'Add Category', value: '' })} className="bg-slate-100 border border-slate-300 px-2 rounded hover:bg-slate-200"><Plus size={14}/></button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Contact Person *</label>
                  <input type="text" required value={supplierForm.contactPerson} onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Mobile Number *</label>
                  <input type="text" required value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Alternate Mobile</label>
                  <input type="text" value={supplierForm.alternateMobile} onChange={(e) => setSupplierForm({ ...supplierForm, alternateMobile: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Email *</label>
                  <input type="email" required value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Website</label>
                  <input type="text" value={supplierForm.website} onChange={(e) => setSupplierForm({ ...supplierForm, website: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={supplierForm.status} onChange={(e) => setSupplierForm({ ...supplierForm, status: e.target.checked })} className="h-4 w-4" />
                    <span className="font-semibold">Active Status</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Tax Details */}
            <div>
              <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2"><FileText size={16}/> Tax & Registration Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">GST Reg. Status</label>
                  <select value={supplierForm.gstStatus} onChange={(e) => setSupplierForm({ ...supplierForm, gstStatus: e.target.value })} className="w-full border border-slate-300 rounded p-2 bg-white">
                    <option>Registered</option>
                    <option>Unregistered</option>
                    <option>Composition</option>
                    <option>SEZ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">GSTIN</label>
                  <input type="text" value={supplierForm.gstin} onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">PAN</label>
                  <input type="text" value={supplierForm.pan} onChange={(e) => setSupplierForm({ ...supplierForm, pan: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">TAN</label>
                  <input type="text" value={supplierForm.tan} onChange={(e) => setSupplierForm({ ...supplierForm, tan: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">MSME / Udyam No.</label>
                  <input type="text" value={supplierForm.msme} onChange={(e) => setSupplierForm({ ...supplierForm, msme: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Tax Preference</label>
                  <select value={supplierForm.taxPreference} onChange={(e) => setSupplierForm({ ...supplierForm, taxPreference: e.target.value })} className="w-full border border-slate-300 rounded p-2 bg-white">
                    {taxPrefs.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={supplierForm.tdsApplicable} onChange={(e) => setSupplierForm({ ...supplierForm, tdsApplicable: e.target.checked })} className="h-4 w-4" />
                    <span className="font-semibold">TDS Applicable</span>
                  </label>
                </div>
                {supplierForm.tdsApplicable && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">TDS Section</label>
                    <input type="text" value={supplierForm.tdsSection} onChange={(e) => setSupplierForm({ ...supplierForm, tdsSection: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Place of Supply</label>
                  <input type="text" value={supplierForm.placeOfSupply} onChange={(e) => setSupplierForm({ ...supplierForm, placeOfSupply: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFormTab === 'address' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-sm text-slate-800 mb-4 flex items-center gap-2"><MapPin size={16} className="text-indigo-600" /> Billing Address</h4>
                <div className="space-y-3">
                  <input type="text" placeholder="Address Line 1" value={supplierForm.billingAddress.street1} onChange={(e) => setSupplierForm({...supplierForm, billingAddress: { ...supplierForm.billingAddress, street1: e.target.value }})} className="w-full border border-slate-300 rounded p-2" />
                  <input type="text" placeholder="Address Line 2" value={supplierForm.billingAddress.street2} onChange={(e) => setSupplierForm({...supplierForm, billingAddress: { ...supplierForm.billingAddress, street2: e.target.value }})} className="w-full border border-slate-300 rounded p-2" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="City" value={supplierForm.billingAddress.city} onChange={(e) => setSupplierForm({...supplierForm, billingAddress: { ...supplierForm.billingAddress, city: e.target.value }})} className="w-full border border-slate-300 rounded p-2" />
                    <input type="text" placeholder="State" value={supplierForm.billingAddress.state} onChange={(e) => setSupplierForm({...supplierForm, billingAddress: { ...supplierForm.billingAddress, state: e.target.value }})} className="w-full border border-slate-300 rounded p-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Country" value={supplierForm.billingAddress.country} onChange={(e) => setSupplierForm({...supplierForm, billingAddress: { ...supplierForm.billingAddress, country: e.target.value }})} className="w-full border border-slate-300 rounded p-2" />
                    <input type="text" placeholder="Pincode" value={supplierForm.billingAddress.zip} onChange={(e) => setSupplierForm({...supplierForm, billingAddress: { ...supplierForm.billingAddress, zip: e.target.value }})} className="w-full border border-slate-300 rounded p-2" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-2"><MapPin size={16} className="text-emerald-600" /> Shipping / Pickup Address</h4>
                  <label className="flex items-center gap-1 cursor-pointer text-xs text-indigo-600 font-medium">
                    <input type="checkbox" checked={copyAddress} onChange={handleCopyAddress} className="rounded h-3 w-3" /> Same as Billing
                  </label>
                </div>
                <div className="space-y-3">
                  <input type="text" disabled={copyAddress} placeholder="Address Line 1" value={copyAddress ? supplierForm.billingAddress.street1 : supplierForm.shippingAddress.street1} onChange={(e) => setSupplierForm({...supplierForm, shippingAddress: { ...supplierForm.shippingAddress, street1: e.target.value }})} className={`w-full border border-slate-300 rounded p-2 ${copyAddress ? 'bg-slate-100 text-gray-500' : 'bg-white'}`} />
                  <input type="text" disabled={copyAddress} placeholder="Address Line 2" value={copyAddress ? supplierForm.billingAddress.street2 : supplierForm.shippingAddress.street2} onChange={(e) => setSupplierForm({...supplierForm, shippingAddress: { ...supplierForm.shippingAddress, street2: e.target.value }})} className={`w-full border border-slate-300 rounded p-2 ${copyAddress ? 'bg-slate-100 text-gray-500' : 'bg-white'}`} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" disabled={copyAddress} placeholder="City" value={copyAddress ? supplierForm.billingAddress.city : supplierForm.shippingAddress.city} onChange={(e) => setSupplierForm({...supplierForm, shippingAddress: { ...supplierForm.shippingAddress, city: e.target.value }})} className={`w-full border border-slate-300 rounded p-2 ${copyAddress ? 'bg-slate-100 text-gray-500' : 'bg-white'}`} />
                    <input type="text" disabled={copyAddress} placeholder="State" value={copyAddress ? supplierForm.billingAddress.state : supplierForm.shippingAddress.state} onChange={(e) => setSupplierForm({...supplierForm, shippingAddress: { ...supplierForm.shippingAddress, state: e.target.value }})} className={`w-full border border-slate-300 rounded p-2 ${copyAddress ? 'bg-slate-100 text-gray-500' : 'bg-white'}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" disabled={copyAddress} placeholder="Country" value={copyAddress ? supplierForm.billingAddress.country : supplierForm.shippingAddress.country} onChange={(e) => setSupplierForm({...supplierForm, shippingAddress: { ...supplierForm.shippingAddress, country: e.target.value }})} className={`w-full border border-slate-300 rounded p-2 ${copyAddress ? 'bg-slate-100 text-gray-500' : 'bg-white'}`} />
                    <input type="text" disabled={copyAddress} placeholder="Pincode" value={copyAddress ? supplierForm.billingAddress.zip : supplierForm.shippingAddress.zip} onChange={(e) => setSupplierForm({...supplierForm, shippingAddress: { ...supplierForm.shippingAddress, zip: e.target.value }})} className={`w-full border border-slate-300 rounded p-2 ${copyAddress ? 'bg-slate-100 text-gray-500' : 'bg-white'}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFormTab === 'contacts' && (
          <div className="space-y-8">
            {/* Multiple Contacts */}
            <div>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><User size={16}/> Multiple Contact Persons</h3>
                <button type="button" onClick={addContact} className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:underline"><Plus size={14}/> Add Contact</button>
              </div>
              {supplierForm.contacts.length === 0 ? (
                <p className="text-gray-400 text-center py-4 border border-dashed rounded">No additional contacts added.</p>
              ) : (
                <div className="space-y-3">
                  {supplierForm.contacts.map((contact, idx) => (
                    <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-slate-50 p-2 border border-slate-200 rounded">
                      <input type="text" placeholder="Name" value={contact.name} onChange={e => { const newArr = [...supplierForm.contacts]; newArr[idx].name = e.target.value; setSupplierForm({...supplierForm, contacts: newArr}); }} className="flex-1 min-w-[120px] border border-slate-300 rounded p-2" />
                      <input type="text" placeholder="Designation" value={contact.designation} onChange={e => { const newArr = [...supplierForm.contacts]; newArr[idx].designation = e.target.value; setSupplierForm({...supplierForm, contacts: newArr}); }} className="flex-1 min-w-[120px] border border-slate-300 rounded p-2" />
                      <input type="text" placeholder="Mobile" value={contact.mobile} onChange={e => { const newArr = [...supplierForm.contacts]; newArr[idx].mobile = e.target.value; setSupplierForm({...supplierForm, contacts: newArr}); }} className="flex-1 min-w-[120px] border border-slate-300 rounded p-2" />
                      <input type="text" placeholder="Email" value={contact.email} onChange={e => { const newArr = [...supplierForm.contacts]; newArr[idx].email = e.target.value; setSupplierForm({...supplierForm, contacts: newArr}); }} className="flex-1 min-w-[120px] border border-slate-300 rounded p-2" />
                      <input type="text" placeholder="Department" value={contact.department} onChange={e => { const newArr = [...supplierForm.contacts]; newArr[idx].department = e.target.value; setSupplierForm({...supplierForm, contacts: newArr}); }} className="flex-1 min-w-[120px] border border-slate-300 rounded p-2" />
                      <button type="button" onClick={() => removeContact(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Multiple Bank Accounts */}
            <div>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><Building size={16}/> Bank Details</h3>
                <button type="button" onClick={addBank} className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:underline"><Plus size={14}/> Add Bank Account</button>
              </div>
              {supplierForm.banks.length === 0 ? (
                <p className="text-gray-400 text-center py-4 border border-dashed rounded">No bank accounts added.</p>
              ) : (
                <div className="space-y-4">
                  {supplierForm.banks.map((bank, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 border border-slate-200 rounded-lg relative">
                      <button type="button" onClick={() => removeBank(idx)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"><X size={16}/></button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Account Holder Name *</label>
                          <input type="text" required value={bank.holderName} onChange={e => { const newArr = [...supplierForm.banks]; newArr[idx].holderName = e.target.value; setSupplierForm({...supplierForm, banks: newArr}); }} className="w-full border border-slate-300 rounded p-2" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Bank Name *</label>
                          <input type="text" required value={bank.bankName} onChange={e => { const newArr = [...supplierForm.banks]; newArr[idx].bankName = e.target.value; setSupplierForm({...supplierForm, banks: newArr}); }} className="w-full border border-slate-300 rounded p-2" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Account Number *</label>
                          <input type="text" required value={bank.accountNumber} onChange={e => { const newArr = [...supplierForm.banks]; newArr[idx].accountNumber = e.target.value; setSupplierForm({...supplierForm, banks: newArr}); }} className="w-full border border-slate-300 rounded p-2" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">IFSC Code *</label>
                          <input type="text" required value={bank.ifsc} onChange={e => { const newArr = [...supplierForm.banks]; newArr[idx].ifsc = e.target.value; setSupplierForm({...supplierForm, banks: newArr}); }} className="w-full border border-slate-300 rounded p-2" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Account Type</label>
                          <select value={bank.type} onChange={e => { const newArr = [...supplierForm.banks]; newArr[idx].type = e.target.value; setSupplierForm({...supplierForm, banks: newArr}); }} className="w-full border border-slate-300 rounded p-2 bg-white">
                            <option>Current</option>
                            <option>Savings</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Branch Name</label>
                          <input type="text" value={bank.branch} onChange={e => { const newArr = [...supplierForm.banks]; newArr[idx].branch = e.target.value; setSupplierForm({...supplierForm, banks: newArr}); }} className="w-full border border-slate-300 rounded p-2" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">UPI ID</label>
                          <input type="text" value={bank.upi} onChange={e => { const newArr = [...supplierForm.banks]; newArr[idx].upi = e.target.value; setSupplierForm({...supplierForm, banks: newArr}); }} className="w-full border border-slate-300 rounded p-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeFormTab === 'commercial' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2"><DollarSign size={16}/> Purchase / Commercial Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Payment Terms</label>
                <div className="flex gap-1">
                  <select value={supplierForm.paymentTerms} onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })} className="flex-1 border border-slate-300 rounded p-2 bg-white">
                    {paymentTermsList.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button type="button" onClick={() => setAddOption({ isOpen: true, targetField: 'paymentTerms', title: 'Add Payment Term', value: '' })} className="bg-slate-100 border border-slate-300 px-2 rounded hover:bg-slate-200"><Plus size={14}/></button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Credit Limit</label>
                <input type="number" value={supplierForm.creditLimit} onChange={(e) => setSupplierForm({ ...supplierForm, creditLimit: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Currency</label>
                <div className="flex gap-1">
                  <select value={supplierForm.currency} onChange={(e) => setSupplierForm({ ...supplierForm, currency: e.target.value })} className="flex-1 border border-slate-300 rounded p-2 bg-white">
                    {currencyList.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button type="button" onClick={() => setAddOption({ isOpen: true, targetField: 'currency', title: 'Add Currency', value: '' })} className="bg-slate-100 border border-slate-300 px-2 rounded hover:bg-slate-200"><Plus size={14}/></button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Purchase Price List</label>
                <input type="text" value={supplierForm.purchasePriceList} onChange={(e) => setSupplierForm({ ...supplierForm, purchasePriceList: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Default Warehouse</label>
                <input type="text" value={supplierForm.defaultWarehouse} onChange={(e) => setSupplierForm({ ...supplierForm, defaultWarehouse: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Delivery Terms</label>
                <input type="text" value={supplierForm.deliveryTerms} onChange={(e) => setSupplierForm({ ...supplierForm, deliveryTerms: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Freight Terms</label>
                <input type="text" value={supplierForm.freightTerms} onChange={(e) => setSupplierForm({ ...supplierForm, freightTerms: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Lead Time (Days)</label>
                <input type="number" value={supplierForm.leadTime} onChange={(e) => setSupplierForm({ ...supplierForm, leadTime: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Minimum Order Qty (MOQ)</label>
                <input type="number" value={supplierForm.moq} onChange={(e) => setSupplierForm({ ...supplierForm, moq: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Discount %</label>
                <input type="number" value={supplierForm.discount} onChange={(e) => setSupplierForm({ ...supplierForm, discount: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Price Validity</label>
                <input type="date" value={supplierForm.priceValidity} onChange={(e) => setSupplierForm({ ...supplierForm, priceValidity: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Purchase Representative</label>
                <input type="text" value={supplierForm.purchaseRep} onChange={(e) => setSupplierForm({ ...supplierForm, purchaseRep: e.target.value })} className="w-full border border-slate-300 rounded p-2" />
              </div>
            </div>
          </div>
        )}

        {activeFormTab === 'products' && (
          <div className="space-y-8">
            {/* Supplier Products */}
            <div>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><Box size={16}/> Supplier Products</h3>
                <button type="button" onClick={addProduct} className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:underline"><Plus size={14}/> Add Product</button>
              </div>
              {supplierForm.products.length === 0 ? (
                <p className="text-gray-400 text-center py-4 border border-dashed rounded">No products mapped.</p>
              ) : (
                <div className="space-y-3">
                  <div className="hidden md:flex gap-2 px-2 text-[10px] font-bold text-gray-500 uppercase">
                    <div className="flex-[2]">Product Name</div>
                    <div className="flex-1">SKU</div>
                    <div className="flex-1">Pur. Price</div>
                    <div className="flex-1">Tax %</div>
                    <div className="flex-1">MOQ</div>
                    <div className="flex-1">Lead Time (D)</div>
                    <div className="w-8"></div>
                  </div>
                  {supplierForm.products.map((prod, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-2 bg-slate-50 p-2 md:p-0 border border-slate-200 md:border-none md:bg-transparent rounded">
                      <input type="text" placeholder="Product Name" value={prod.product} onChange={e => { const newArr = [...supplierForm.products]; newArr[idx].product = e.target.value; setSupplierForm({...supplierForm, products: newArr}); }} className="flex-[2] border border-slate-300 rounded p-2" />
                      <input type="text" placeholder="SKU" value={prod.sku} onChange={e => { const newArr = [...supplierForm.products]; newArr[idx].sku = e.target.value; setSupplierForm({...supplierForm, products: newArr}); }} className="flex-1 border border-slate-300 rounded p-2" />
                      <input type="number" placeholder="Price" value={prod.purchasePrice} onChange={e => { const newArr = [...supplierForm.products]; newArr[idx].purchasePrice = e.target.value; setSupplierForm({...supplierForm, products: newArr}); }} className="flex-1 border border-slate-300 rounded p-2" />
                      <input type="number" placeholder="Tax %" value={prod.tax} onChange={e => { const newArr = [...supplierForm.products]; newArr[idx].tax = e.target.value; setSupplierForm({...supplierForm, products: newArr}); }} className="flex-1 border border-slate-300 rounded p-2" />
                      <input type="number" placeholder="MOQ" value={prod.moq} onChange={e => { const newArr = [...supplierForm.products]; newArr[idx].moq = e.target.value; setSupplierForm({...supplierForm, products: newArr}); }} className="flex-1 border border-slate-300 rounded p-2" />
                      <input type="number" placeholder="Lead Time" value={prod.leadTime} onChange={e => { const newArr = [...supplierForm.products]; newArr[idx].leadTime = e.target.value; setSupplierForm({...supplierForm, products: newArr}); }} className="flex-1 border border-slate-300 rounded p-2" />
                      <button type="button" onClick={() => removeProduct(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded w-full md:w-auto flex justify-center"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents Upload */}
            <div>
              <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2"><FileText size={16}/> Documents Upload</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'GST Certificate', field: 'gstCert' },
                  { label: 'PAN Card', field: 'panCard' },
                  { label: 'MSME Certificate', field: 'msmeCert' },
                  { label: 'Cancelled Cheque', field: 'cheque' },
                  { label: 'Company Reg.', field: 'companyCert' },
                  { label: 'Agreement', field: 'agreement' }
                ].map(doc => (
                  <label key={doc.field} className="border border-dashed border-slate-300 p-4 text-center rounded bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors block">
                    <p className="text-xs font-semibold text-slate-700 mb-1">{doc.label}</p>
                    {supplierForm.documents[doc.field] ? (
                      <p className="text-[10px] text-green-600 font-semibold"><Check size={12} className="inline mr-1"/>Uploaded</p>
                    ) : (
                      <p className="text-[10px] text-slate-500">Click to upload</p>
                    )}
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, doc.field)} />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeFormTab === 'performance' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2"><Star size={16}/> Supplier Performance Ratings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Overall Supplier Rating (1-5)</label>
                <input type="number" min="0" max="5" step="0.1" value={supplierForm.performance.supplierRating} onChange={(e) => setSupplierForm({...supplierForm, performance: {...supplierForm.performance, supplierRating: e.target.value}})} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Quality Rating (1-5)</label>
                <input type="number" min="0" max="5" step="0.1" value={supplierForm.performance.qualityRating} onChange={(e) => setSupplierForm({...supplierForm, performance: {...supplierForm.performance, qualityRating: e.target.value}})} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Delivery Rating (1-5)</label>
                <input type="number" min="0" max="5" step="0.1" value={supplierForm.performance.deliveryRating} onChange={(e) => setSupplierForm({...supplierForm, performance: {...supplierForm.performance, deliveryRating: e.target.value}})} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">On-Time Delivery %</label>
                <input type="number" value={supplierForm.performance.onTimeDelivery} onChange={(e) => setSupplierForm({...supplierForm, performance: {...supplierForm.performance, onTimeDelivery: e.target.value}})} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Rejection %</label>
                <input type="number" value={supplierForm.performance.rejectionPercent} onChange={(e) => setSupplierForm({...supplierForm, performance: {...supplierForm.performance, rejectionPercent: e.target.value}})} className="w-full border border-slate-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Avg Delivery Time (Days)</label>
                <input type="number" value={supplierForm.performance.avgDeliveryTime} onChange={(e) => setSupplierForm({...supplierForm, performance: {...supplierForm.performance, avgDeliveryTime: e.target.value}})} className="w-full border border-slate-300 rounded p-2" />
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Form Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 rounded-b-xl">
        <button type="button" onClick={onCancel} className="px-5 py-2 rounded border border-slate-300 hover:bg-slate-100 font-semibold text-xs">Cancel</button>
        
        {activeFormTab !== 'basic' && (
          <button type="button" onClick={() => {
            const tabs = ['basic', 'address', 'contacts', 'commercial', 'products', 'performance'];
            setActiveFormTab(tabs[tabs.indexOf(activeFormTab) - 1]);
          }} className="px-5 py-2 rounded border border-slate-300 hover:bg-slate-100 font-semibold text-xs">Back</button>
        )}

        {activeFormTab === 'performance' ? (
          <button onClick={handleFormSubmit} className="px-6 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">Save Supplier</button>
        ) : (
          <button type="button" onClick={() => {
            const tabs = ['basic', 'address', 'contacts', 'commercial', 'products', 'performance'];
            setActiveFormTab(tabs[tabs.indexOf(activeFormTab) + 1]);
          }} className="px-6 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">Save & Next</button>
        )}
      </div>

      {/* Add Custom Dropdown Option Modal */}
      {addOption.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-slide-in-right">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800">{addOption.title}</h3>
              <button onClick={() => setAddOption({...addOption, isOpen: false})} className="text-gray-400 hover:text-black"><X size={16}/></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">New Value</label>
                <input autoFocus type="text" value={addOption.value} onChange={e => setAddOption({...addOption, value: e.target.value})} className="w-full border border-slate-300 rounded p-2 text-sm" placeholder="Enter new option..." />
              </div>
              <button onClick={handleAddOptionSubmit} className="w-full bg-indigo-600 text-white font-bold py-2 rounded text-sm hover:bg-indigo-700">Add Option</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierForm;
