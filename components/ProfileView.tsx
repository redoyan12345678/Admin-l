
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { db } from '../firebase';
import { ref, update } from 'firebase/database';
import { User as UserIcon, Copy, Save, Camera, Upload } from 'lucide-react';

interface ProfileViewProps {
    user: User;
    onBack: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onBack }) => {
    const [name, setName] = useState(user.name);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            await update(ref(db, `users/${user.id}`), { name: name });
            alert("Profile updated!");
        } catch (e) {
            alert("Error updating profile");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 1000000) { // 1MB Limit
                alert("Image size too large. Please choose an image under 1MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                try {
                    await update(ref(db, `users/${user.id}`), { avatar: base64String });
                    // No alert needed, realtime update will show it
                } catch (e) {
                    alert("Error uploading image");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <button onClick={onBack} className="text-sm font-bold text-slate-500">Back</button>
                <h1 className="text-2xl font-bold">My Profile</h1>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 group">
                    <div className="w-full h-full bg-slate-100 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
                        <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-violet-600 text-white p-2 rounded-full shadow-lg active:scale-90 transition-transform"
                    >
                        <Camera size={16} />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                <p className="text-xs text-slate-400 font-mono bg-slate-50 inline-block px-3 py-1 rounded-full mb-4 select-all">
                    ID: {user.id} <button onClick={() => navigator.clipboard.writeText(user.id)}><Copy size={10} className="inline ml-1"/></button>
                </p>

                <div className="space-y-4 text-left">
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">Display Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-violet-500 font-bold text-slate-800"
                        />
                    </div>
                    
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> {saving ? 'Saving...' : 'Update Profile'}
                    </button>
                </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 mb-2">Account Status</h3>
                <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <p className="text-sm font-medium text-indigo-800">
                        {user.isActive ? 'Active Member (VIP)' : 'Inactive Account'}
                    </p>
                </div>
                <p className="text-xs text-indigo-600">
                    {user.isActive ? 'You are eligible for all commissions.' : 'Activate your account to start earning.'}
                </p>
            </div>
        </div>
    );
};
