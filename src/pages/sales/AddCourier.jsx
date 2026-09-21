import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Truck, Upload } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import DynamicSelect from '../../components/DynamicSelect';

const AddCourier = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    courierCode: 'CR-00001',
    courierName: '',
    courierType: 'Domestic',
    company: 'Select',
    branch: 'Select',
    status: 'Active',
    description: '',
    contactPerson: '',
    mobileNumber: '',
    altMobile: '',
    email: '',
    website: '',
    customerCare: '',
    addressLine1: '',
    addressLine2: '',
    country: 'Select',
    state: 'Select',
    city: 'Select',
    district: 'Select',
    pincode: '',
    serviceType: 'Standard',
    deliveryMode: 'Road',
    deliveryDays: '2-5 Days',
    pickupAvailable: true,
    codAvailable: true,
    trackingAvailable: true,
    reversePickup: true,
    internationalShipping: false,
    serviceStates: 'Select',
    serviceCities: 'Select',
    servicePincodes: '',
    baseCharge: '',
    perKgCharge: '',
    additionalKg: '',
    codCharge: '',
    fuelSurcharge: '',
    returnCharge: '',
    tax: 'Select',
    currency: 'INR',
    trackingURL: '',
    trackingPrefix: '',
    apiAvailable: true,
    apiProvider: 'Select',
    autoTrackingUpdate: true,
    defaultCourier: true,
    priority: '',
    remarks: ''
  });

  useEffect(() => {
    if (id) {
      const fetchCourier = async () => {
        try {
          const { data } = await api.get(`/couriers/${id}`);
          if (data.success && data.data) {
            const c = data.data;
            setForm({
              courierCode: c.courierCode || '',
              courierName: c.name || '',
              courierType: c.type || 'Domestic',
              company: c.company || 'Select',
              branch: c.branch || 'Select',
              status: c.status || 'Active',
              description: c.description || '',
              contactPerson: c.contactPerson || '',
              mobileNumber: c.phone || '',
              altMobile: c.alternateMobile || '',
              email: c.email || '',
              website: c.website || '',
              customerCare: c.customerCare || '',
              addressLine1: c.addressLine1 || '',
              addressLine2: c.addressLine2 || '',
              country: c.country || 'Select',
              state: c.state || 'Select',
              city: c.city || 'Select',
              district: c.district || 'Select',
              pincode: c.pincode || '',
              serviceType: c.serviceType || 'Standard',
              deliveryMode: c.deliveryMode || 'Road',
              deliveryDays: c.deliveryDays || '2-5 Days',
              pickupAvailable: c.pickupAvailable ?? true,
              codAvailable: c.codAvailable ?? true,
              trackingAvailable: c.trackingAvailable ?? true,
              reversePickup: c.reversePickup ?? true,
              internationalShipping: c.internationalShipping ?? false,
              serviceStates: c.serviceAreaStates?.[0] || 'Select',
              serviceCities: c.serviceAreaCities?.[0] || 'Select',
              servicePincodes: c.serviceAreaPincodes?.[0] || '',
              baseCharge: c.baseCharge || '',
              perKgCharge: c.perKgCharge || '',
              additionalKg: c.additionalKgCharge || '',
              codCharge: c.codCharge || '',
              fuelSurcharge: c.fuelSurcharge || '',
              returnCharge: c.returnCharge || '',
              tax: c.tax || 'Select',
              currency: c.currency || 'INR',
              trackingURL: c.trackingUrl || '',
              trackingPrefix: c.trackingPrefix || '',
              apiAvailable: c.apiAvailable ?? true,
              apiProvider: c.apiProvider || 'Select',
              autoTrackingUpdate: c.autoTrackingUpdate ?? true,
              defaultCourier: c.isDefaultCourier ?? true,
              priority: c.priority || '',
              remarks: c.remarks || ''
            });
          }
        } catch (error) {
          console.error("Error fetching courier", error);
        }
      };
      fetchCourier();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };



  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        courierCode: form.courierCode,
        name: form.courierName,
        type: form.courierType,
        company: form.company,
        branch: form.branch,
        status: form.status,
        description: form.description,
        contactPerson: form.contactPerson,
        phone: form.mobileNumber,
        alternateMobile: form.altMobile,
        email: form.email,
        website: form.website,
        customerCare: form.customerCare,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        country: form.country,
        state: form.state,
        city: form.city,
        district: form.district,
        pincode: form.pincode,
        serviceType: form.serviceType,
        deliveryMode: form.deliveryMode,
        deliveryDays: form.deliveryDays,
        pickupAvailable: form.pickupAvailable,
        codAvailable: form.codAvailable,
        trackingAvailable: form.trackingAvailable,
        reversePickup: form.reversePickup,
        internationalShipping: form.internationalShipping,
        serviceAreaStates: [form.serviceStates],
        serviceAreaCities: [form.serviceCities],
        serviceAreaPincodes: [form.servicePincodes],
        baseCharge: Number(form.baseCharge) || 0,
        perKgCharge: Number(form.perKgCharge) || 0,
        additionalKgCharge: Number(form.additionalKg) || 0,
        codCharge: Number(form.codCharge) || 0,
        fuelSurcharge: Number(form.fuelSurcharge) || 0,
        returnCharge: Number(form.returnCharge) || 0,
        tax: form.tax,
        currency: form.currency,
        trackingUrl: form.trackingURL,
        trackingPrefix: form.trackingPrefix,
        apiAvailable: form.apiAvailable,
        apiProvider: form.apiProvider,
        autoTrackingUpdate: form.autoTrackingUpdate,
        isDefaultCourier: form.defaultCourier,
        priority: Number(form.priority) || 0,
        remarks: form.remarks
      };

      if (id) {
        await api.put(`/couriers/${id}`, payload);
        alert('Courier updated successfully!');
      } else {
        await api.post('/couriers', payload);
        alert('Courier registered successfully!');
      }
      navigate('/sales/courier-list');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error saving courier');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Top Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/sales/courier-list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Courier List
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-indigo-900 uppercase tracking-wide">Create New Courier</h2>
          <p className="text-sm text-slate-500 font-medium">Add courier / shipping partner</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 gap-6">
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Courier Code *</label>
                  <input type="text" name="courierCode" value={form.courierCode} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Courier Name *</label>
                  <input type="text" name="courierName" value={form.courierName} onChange={handleChange} required placeholder="Enter Name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Courier Type *</label>
                  <DynamicSelect category="CourierType" name="courierType" value={form.courierType} onChange={handleChange} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                  <select name="company" value={form.company} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Select</option>
                    <option>Allcore Solutions</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                  <DynamicSelect category="Branch" name="branch" value={form.branch} onChange={handleChange} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <DynamicSelect category="Status" name="status" value={form.status} onChange={handleChange} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows="2" placeholder="Brief description..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

            {/* SECTION: CONTACT DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
                  <input type="text" name="contactPerson" value={form.contactPerson} onChange={handleChange} required placeholder="Name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input type="text" name="mobileNumber" value={form.mobileNumber} onChange={handleChange} required placeholder="Phone" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alternate Mobile</label>
                  <input type="text" name="altMobile" value={form.altMobile} onChange={handleChange} placeholder="Secondary Phone" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email address" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Website</label>
                  <input type="url" name="website" value={form.website} onChange={handleChange} placeholder="www.example.com" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Care</label>
                  <input type="text" name="customerCare" value={form.customerCare} onChange={handleChange} placeholder="Support number/email" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: ADDRESS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address Line 1 *</label>
                <input type="text" name="addressLine1" value={form.addressLine1} onChange={handleChange} required placeholder="Street address" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
              </div>
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address Line 2</label>
                <input type="text" name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Apartment, suite, etc." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <DynamicSelect category="Country" name="country" value={form.country} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <DynamicSelect category="State" name="state" value={form.state} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <DynamicSelect category="City" name="city" value={form.city} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                <DynamicSelect category="District" name="district" value={form.district} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
                <input type="text" name="pincode" value={form.pincode} onChange={handleChange} placeholder="ZIP code" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 gap-6">
            {/* SECTION: SERVICE DETAILS & AREA */}
            <div className="flex flex-col gap-6">
              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Service Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type *</label>
                    <DynamicSelect category="ServiceType" name="serviceType" value={form.serviceType} onChange={handleChange} />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Mode</label>
                    <DynamicSelect category="DeliveryMode" name="deliveryMode" value={form.deliveryMode} onChange={handleChange} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Days</label>
                    <input type="text" name="deliveryDays" value={form.deliveryDays} onChange={handleChange} placeholder="e.g. 2-5 Days" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" name="pickupAvailable" checked={form.pickupAvailable} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      Pickup Available
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" name="codAvailable" checked={form.codAvailable} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      COD Available
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" name="trackingAvailable" checked={form.trackingAvailable} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      Tracking Available
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" name="reversePickup" checked={form.reversePickup} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      Reverse Pickup
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" name="internationalShipping" checked={form.internationalShipping} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      International Shipping
                    </label>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Service Area</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">States</label>
                    <DynamicSelect category="State" name="serviceStates" value={form.serviceStates} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cities</label>
                    <DynamicSelect category="City" name="serviceCities" value={form.serviceCities} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pincodes</label>
                    <input type="text" name="servicePincodes" value={form.servicePincodes} onChange={handleChange} placeholder="+ Add Pincodes" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: SHIPPING CHARGES */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Shipping Charges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base Charge</label>
                  <input type="number" name="baseCharge" value={form.baseCharge} onChange={handleChange} placeholder="e.g. 50" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Per KG Charge</label>
                  <input type="number" name="perKgCharge" value={form.perKgCharge} onChange={handleChange} placeholder="e.g. 10" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Additional KG</label>
                  <input type="number" name="additionalKg" value={form.additionalKg} onChange={handleChange} placeholder="e.g. 10" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">COD Charge</label>
                  <input type="number" name="codCharge" value={form.codCharge} onChange={handleChange} placeholder="e.g. 50" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel Surcharge</label>
                  <input type="number" name="fuelSurcharge" value={form.fuelSurcharge} onChange={handleChange} placeholder="e.g. 5" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Return Charge</label>
                  <input type="number" name="returnCharge" value={form.returnCharge} onChange={handleChange} placeholder="e.g. 40" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tax</label>
                  <DynamicSelect category="TaxConfiguration" name="tax" value={form.tax} onChange={handleChange} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                  <DynamicSelect category="Currency" name="currency" value={form.currency} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 gap-6">
            {/* SECTION: TRACKING & INTEGRATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Tracking & Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tracking URL</label>
                  <input type="url" name="trackingURL" value={form.trackingURL} onChange={handleChange} placeholder="https://..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tracking Prefix</label>
                  <input type="text" name="trackingPrefix" value={form.trackingPrefix} onChange={handleChange} placeholder="e.g. AWB" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1 mt-2 md:mt-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="apiAvailable" checked={form.apiAvailable} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    API Available
                  </label>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">API Provider</label>
                  <DynamicSelect category="APIProvider" name="apiProvider" value={form.apiProvider} onChange={handleChange} />
                </div>
                <div className="col-span-2 md:col-span-1 mt-2 md:mt-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="autoTrackingUpdate" checked={form.autoTrackingUpdate} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    Auto Tracking Update
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION: DOCUMENTS & ADDITIONAL INFO */}
            <div className="flex flex-col gap-6">
              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Documents</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-semibold text-slate-700">Agreement</span>
                    <label className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded cursor-pointer">
                      Upload
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-semibold text-slate-700">GST Certificate</span>
                    <label className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded cursor-pointer">
                      Upload
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-semibold text-slate-700">Rate Contract</span>
                    <label className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded cursor-pointer">
                      Upload
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1 mt-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" name="defaultCourier" checked={form.defaultCourier} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      Default Courier
                    </label>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                    <input type="number" name="priority" value={form.priority} onChange={handleChange} placeholder="e.g. 1" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                    <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="2" placeholder="Any internal remarks..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FORM ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button type="button" onClick={() => navigate('/sales/courier-list')} className="px-6 py-2.5 border border-slate-300 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Cancel
            </button>
            <button type="button" className="px-6 py-2.5 border border-indigo-200 bg-indigo-50 rounded text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm">
              Save Draft
            </button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
              <Truck size={16} /> Create Courier
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AddCourier;
