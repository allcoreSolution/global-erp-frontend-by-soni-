import React, { useState, useEffect } from 'react';
import { Building, Save, Upload, Palette } from 'lucide-react';

const CompanyProfileSettings = () => {
  const [profile, setProfile] = useState({
    name: '',
    gstNumber: '',
    logoUrl: '',
    themeColor: '#1e293b'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await window.api.get('/companies/profile');
      setProfile({
        name: data.name || '',
        gstNumber: data.gstNumber || '',
        logoUrl: data.logoUrl || '',
        themeColor: data.themeColor || '#1e293b'
      });
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await window.api.put('/companies/profile', profile);
      
      // Update local storage so the UI updates immediately without re-login
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj.company) {
          userObj.company.name = profile.name;
          userObj.company.logoUrl = profile.logoUrl;
          userObj.company.themeColor = profile.themeColor;
          localStorage.setItem('user', JSON.stringify(userObj));
          // Dispatch a custom event to notify other components (like Sidebar)
          window.dispatchEvent(new Event('userUpdated'));
        }
      }
      alert('Company profile saved! The page might need a refresh to fully apply the theme.');
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving profile');
    }
  };

  if (isLoading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Building className="text-blue-600" size={22} /> Company Profile & Branding
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Update your company name, logo, and theme color.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm" onClick={handleSave}>
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="border border-gray-200 rounded-xl p-5 space-y-6">
           <h3 className="text-xs font-bold uppercase text-slate-700">Basic Information</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1">Company Name</label>
               <input 
                 type="text" 
                 className="w-full text-xs border rounded p-2 focus:ring-1 focus:ring-blue-500" 
                 value={profile.name}
                 onChange={(e) => setProfile({...profile, name: e.target.value})}
                 required
               />
             </div>
             <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1">Tax ID (GSTIN/VAT)</label>
               <input 
                 type="text" 
                 className="w-full text-xs border rounded p-2 focus:ring-1 focus:ring-blue-500" 
                 value={profile.gstNumber}
                 onChange={(e) => setProfile({...profile, gstNumber: e.target.value})}
               />
             </div>
           </div>

           <div className="border-t pt-4">
             <h3 className="text-xs font-bold uppercase text-slate-700 mb-4 flex items-center gap-2">
               <Palette size={16} className="text-indigo-500" /> Branding (White-label)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Logo Upload */}
               <div>
                 <label className="block text-xs font-semibold text-gray-600 mb-2">Company Logo</label>
                 <div className="flex items-start gap-4">
                   <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-slate-50">
                     {profile.logoUrl ? (
                       <img src={profile.logoUrl} alt="Logo" className="object-contain w-full h-full p-1" />
                     ) : (
                       <span className="text-[10px] text-gray-400">No Logo</span>
                     )}
                   </div>
                   <div className="space-y-2">
                     <label className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border rounded cursor-pointer transition">
                       <Upload size={14} /> Upload Image
                       <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageUpload} />
                     </label>
                     <p className="text-[10px] text-gray-500 max-w-xs">Recommended size: 250x100px. PNG or JPG format.</p>
                     {profile.logoUrl && (
                       <button 
                         type="button" 
                         onClick={() => setProfile({...profile, logoUrl: ''})}
                         className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold"
                       >
                         Remove Logo
                       </button>
                     )}
                   </div>
                 </div>
               </div>

               {/* Theme Color Picker */}
               <div>
                 <label className="block text-xs font-semibold text-gray-600 mb-2">Dashboard Theme Color</label>
                 <div className="flex items-center gap-3">
                   <input 
                     type="color" 
                     value={profile.themeColor}
                     onChange={(e) => setProfile({...profile, themeColor: e.target.value})}
                     className="w-10 h-10 rounded cursor-pointer border p-0.5"
                   />
                   <div>
                     <p className="text-xs font-bold text-gray-700">{profile.themeColor.toUpperCase()}</p>
                     <p className="text-[10px] text-gray-500">This color will be used for the sidebar and main accents.</p>
                   </div>
                 </div>
                 <div className="mt-4 flex gap-2">
                   <button type="button" onClick={() => setProfile({...profile, themeColor: '#1e293b'})} className="w-6 h-6 rounded-full bg-[#1e293b] border-2 border-white shadow-sm" title="Default Slate"></button>
                   <button type="button" onClick={() => setProfile({...profile, themeColor: '#4f46e5'})} className="w-6 h-6 rounded-full bg-[#4f46e5] border-2 border-white shadow-sm" title="Indigo"></button>
                   <button type="button" onClick={() => setProfile({...profile, themeColor: '#0ea5e9'})} className="w-6 h-6 rounded-full bg-[#0ea5e9] border-2 border-white shadow-sm" title="Sky Blue"></button>
                   <button type="button" onClick={() => setProfile({...profile, themeColor: '#10b981'})} className="w-6 h-6 rounded-full bg-[#10b981] border-2 border-white shadow-sm" title="Emerald"></button>
                   <button type="button" onClick={() => setProfile({...profile, themeColor: '#e11d48'})} className="w-6 h-6 rounded-full bg-[#e11d48] border-2 border-white shadow-sm" title="Rose"></button>
                 </div>
               </div>

             </div>
           </div>
        </div>
      </form>
    </div>
  );
};
export default CompanyProfileSettings;
