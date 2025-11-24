
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';
import { Lock, Star, ChevronLeft } from 'lucide-react';

interface LevelViewProps {
    user: User;
    onBack: () => void;
}

export const LevelView: React.FC<LevelViewProps> = ({ user, onBack }) => {
    const [referralCount, setReferralCount] = useState(0);

    useEffect(() => {
        const usersRef = ref(db, 'users');
        get(usersRef).then(snapshot => {
            if (snapshot.exists()) {
                const users = Object.values(snapshot.val()) as User[];
                const myRefs = users.filter(u => 
                    u.referrerId && 
                    u.referrerId.toUpperCase() === user.referralCode.toUpperCase()
                ).length;
                setReferralCount(myRefs);
            }
        });
    }, [user.referralCode]);

    const levels = [
        { level: 1, max: 30, color: 'from-blue-500 to-cyan-400', dotColor: 'bg-cyan-400' },
        { level: 2, max: 60, color: 'from-violet-500 to-purple-400', dotColor: 'bg-purple-400' },
        { level: 3, max: 90, color: 'from-pink-500 to-rose-400', dotColor: 'bg-rose-400' },
        { level: 4, max: 120, color: 'from-amber-500 to-orange-400', dotColor: 'bg-orange-400' },
        { level: 5, max: 0, comingSoon: true },
        { level: 6, max: 0, comingSoon: true },
        { level: 7, max: 0, comingSoon: true },
    ];

    const currentLevelIndex = levels.findIndex(l => referralCount < l.max);
    // If all levels passed, set to last
    const activeLevelIdx = currentLevelIndex === -1 ? 4 : currentLevelIndex;

    const renderDots = (totalRequired: number, accumulatedPrevious: number, dotColorClass: string) => {
        const dots = [];
        const requiredForThisLevel = 30; // 30 per step
        // Referrals contributing to this level
        const filled = Math.max(0, Math.min(referralCount - accumulatedPrevious, requiredForThisLevel));

        for (let i = 0; i < requiredForThisLevel; i++) {
            const isFilled = i < filled;
            dots.push(
                <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${isFilled ? `${dotColorClass} shadow-[0_0_5px_currentColor]` : 'bg-slate-200'}`}
                ></div>
            );
        }
        return dots;
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                    <ChevronLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-slate-800">Level Slots</h1>
            </div>

            <div className="grid gap-6">
                {levels.map((lvl, index) => {
                    if (lvl.comingSoon) {
                        return (
                            <div key={index} className="bg-slate-100 rounded-3xl p-6 border-2 border-slate-200 border-dashed relative opacity-70">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="bg-slate-200 text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase">Coming Soon</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-400 mb-2">Level {lvl.level}</h3>
                                <div className="h-20"></div>
                            </div>
                        )
                    }

                    const prevMax = index === 0 ? 0 : levels[index - 1].max;
                    const isActive = referralCount >= prevMax;
                    const isCompleted = referralCount >= lvl.max;
                    
                    return (
                        <div key={index} className={`relative rounded-3xl p-6 transition-all duration-500 overflow-hidden ${isActive ? 'bg-white shadow-xl border border-slate-100 scale-100 opacity-100' : 'bg-slate-50 border border-slate-100 scale-95 opacity-60 grayscale'}`}>
                            
                            {!isActive && (
                                <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                                    <Lock className="text-slate-400" size={32} />
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`text-xl font-bold flex items-center gap-2 ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                                    <Star className={isCompleted ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} size={24}/>
                                    Level {lvl.level}
                                </h3>
                                <span className="text-xs font-mono text-slate-400 font-bold">
                                    {Math.min(Math.max(0, referralCount - prevMax), 30)}/30
                                </span>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <div className="grid grid-cols-10 gap-2 place-items-center">
                                    {renderDots(lvl.max, prevMax, lvl.dotColor || 'bg-blue-500')}
                                </div>
                            </div>
                            
                            {isActive && !isCompleted && (
                                <p className="text-center text-xs text-slate-400 mt-4 animate-pulse">
                                    Keep referring to fill slots!
                                </p>
                            )}
                            {isCompleted && (
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full">COMPLETED</div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
