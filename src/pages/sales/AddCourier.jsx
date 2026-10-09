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
    status: 'Active',
    contactPerson: '',
    mobileNumber: '',
    email: '',
    addressLine1: '',
    state: 'Select',
    city: 'Select',
    pincode: '',
    serviceType: 'Standard',
    deliveryMode: 'Road',
    deliveryDays: '2-5 Days',
    pickupAvailable: true,
    codAvailable: true,
    trackingAvailable: true,
    reversePickup: true,
    defaultVehicleNo: '',
    defaultDriverName: '',
    defaultDriverMobile: '',
    volumetricDivisor: '5000',
    trackingURL: '',
    defaultCourier: true
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
              status: c.status || 'Active',
              contactPerson: c.contactPerson || '',
              mobileNumber: c.phone || '',
              email: c.email || '',
              addressLine1: c.addressLine1 || '',
              state: c.state || 'Select',
              city: c.city || 'Select',
              pincode: c.pincode || '',
              serviceType: c.serviceType || 'Standard',
              deliveryMode: c.deliveryMode || 'Road',
              deliveryDays: c.deliveryDays || '2-5 Days',
              pickupAvailable: c.pickupAvailable ?? true,
              codAvailable: c.codAvailable ?? true,
              trackingAvailable: c.trackingAvailable ?? true,
              reversePickup: c.reversePickup ?? true,
              defaultVehicleNo: c.defaultVehicleNo || '',
              defaultDriverName: c.defaultDriverName || '',
              defaultDriverMobile: c.defaultDriverMobile || '',
              volumetricDivisor: c.volumetricDivisor?.toString() || '5000',
              trackingURL: c.trackingUrl || '',
              defaultCourier: c.isDefaultCourier ?? true
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
        status: form.status,
        contactPerson: form.contactPerson,
        phone: form.mobileNumber,
        email: form.email,
        addressLine1: form.addressLine1,
        state: form.state,
        city: form.city,
        pincode: form.pincode,
        serviceType: form.serviceType,
        deliveryMode: form.deliveryMode,
        deliveryDays: form.deliveryDays,
        pickupAvailable: form.pickupAvailable,
        codAvailable: form.codAvailable,
        trackingAvailable: form.trackingAvailable,
        reversePickup: form.reversePickup,
        defaultVehicleNo: form.defaultVehicleNo,
        defaultDriverName: form.defaultDriverName,
        defaultDriverMobile: form.defaultDriverMobile,
        volumetricDivisor: Number(form.volumetricDivisor) || 5000,
        trackingUrl: form.trackingURL,
        isDefaultCourier: form.defaultCourier
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
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
                  <DynamicSelect category="CourierType" name="courierType" value={form.courierType} onChange={handleChange} defaultOptions={['Domestic', 'International', 'Local']} hideAddButton={false} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <DynamicSelect category="Status" name="status" value={form.status} onChange={handleChange} defaultOptions={['Active', 'Inactive']} hideAddButton={true} />
                </div>
              </div>
            </div>

            {/* SECTION: CONTACT DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Contact Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
                  <input type="text" name="contactPerson" value={form.contactPerson} onChange={handleChange} required placeholder="Name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input type="text" name="mobileNumber" value={form.mobileNumber} onChange={handleChange} required placeholder="Phone" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email address" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: ADDRESS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address Line 1 *</label>
                <input type="text" name="addressLine1" value={form.addressLine1} onChange={handleChange} required placeholder="Street address, Suite, etc." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <DynamicSelect category="State" name="state" value={form.state} onChange={handleChange} hideAddButton={false} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <DynamicSelect category="City" name="city" value={form.city} onChange={handleChange} hideAddButton={false} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
                <input type="text" name="pincode" value={form.pincode} onChange={handleChange} placeholder="ZIP code" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SECTION: SERVICE DETAILS & AREA */}
            <div className="flex flex-col gap-6">
              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Service Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type *</label>
                    <DynamicSelect category="ServiceType" name="serviceType" value={form.serviceType} onChange={handleChange} defaultOptions={['Standard', 'Express']} hideAddButton={false} />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Mode</label>
                    <DynamicSelect category="DeliveryMode" name="deliveryMode" value={form.deliveryMode} onChange={handleChange} defaultOptions={['Road', 'Air', 'Sea']} hideAddButton={false} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Days</label>
                    <input type="text" name="deliveryDays" value={form.deliveryDays} onChange={handleChange} placeholder="e.g. 2-5 Days" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-2 mt-2">
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
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: DEFAULT FLEET & FORMULAS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Default Fleet & Formulas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Vehicle No.</label>
                  <input type="text" name="defaultVehicleNo" value={form.defaultVehicleNo} onChange={handleChange} placeholder="e.g. UP32AB1234" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Volumetric Divisor</label>
                  <select name="volumetricDivisor" value={form.volumetricDivisor} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="5000">5000 (Standard)</option>
                    <option value="4000">4000 (Express/Air)</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Name</label>
                  <input type="text" name="defaultDriverName" value={form.defaultDriverName} onChange={handleChange} placeholder="Name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Mobile</label>
                  <input type="text" name="defaultDriverMobile" value={form.defaultDriverMobile} onChange={handleChange} placeholder="Phone" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SECTION: TRACKING & ADDITIONAL OPTIONS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Tracking & Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tracking URL</label>
                  <input type="url" name="trackingURL" value={form.trackingURL} onChange={handleChange} placeholder="https://..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 mt-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="defaultCourier" checked={form.defaultCourier} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    Set as Default Courier
                  </label>
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
