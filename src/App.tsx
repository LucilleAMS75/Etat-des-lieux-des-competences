/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  GraduationCap, 
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Structure and definition of the 9 nexia deliverables
interface Deliverable {
  id: number;
  label: string;
  competencies: string[];
}

const DELIVERABLES: Deliverable[] = [
  {
    id: 1,
    label: "Identité managériale : mon style, mes forces, mes axes de développement",
    competencies: ["C6"]
  },
  {
    id: 2,
    label: "Cartographie de l'équipe : compétences, profils, écarts des 6 collaborateurs NEXIA",
    competencies: ["C1", "C2"]
  },
  {
    id: 3,
    label: "Organisation & planning : rôles, jalons, objectifs SMART",
    competencies: ["C2", "C3"]
  },
  {
    id: 4,
    label: "Tableau de bord : indicateurs, écarts, actions correctives, note de synthèse",
    competencies: ["C3", "C9"]
  },
  {
    id: 5,
    label: "Charte QVCT : engagements, aménagements, prévention RPS",
    competencies: ["C4", "C5"]
  },
  {
    id: 6,
    label: "Communication adaptée : grille des 6 profils, canaux, postures, formulations",
    competencies: ["C6", "C10"]
  },
  {
    id: 7,
    label: "Plan de progression : feedbacks, actions d'accompagnement, indicateurs",
    competencies: ["C7"]
  },
  {
    id: 8,
    label: "Prévention & médiation : signaux faibles, plan de médiation NEXIA",
    competencies: ["C8"]
  },
  {
    id: 9,
    label: "Communication hiérarchique : schéma de flux, canaux, formats",
    competencies: ["C10"]
  }
];

export default function App() {
  // Key state of the assessments maps (id -> status)
  const [statuses, setStatuses] = useState<Record<number, 'solide' | 'consolider' | null>>(() => {
    try {
      const saved = localStorage.getItem('checklist_livrables_nexia_v1');
      if (saved) {
        const parsed = JSON.parse(saved) as Array<{ id: number; status: 'solide' | 'consolider' | null }>;
        if (Array.isArray(parsed)) {
          const initialMap: Record<number, 'solide' | 'consolider' | null> = {};
          // Initialize default mapping
          for (let i = 1; i <= 9; i++) {
            initialMap[i] = null;
          }
          parsed.forEach(item => {
            if (item && item.id >= 1 && item.id <= 9) {
              initialMap[item.id] = item.status;
            }
          });
          return initialMap;
        }
      }
    } catch (error) {
      console.error("Failed to parse localStorage:", error);
    }
    
    const defaultMap: Record<number, 'solide' | 'consolider' | null> = {};
    for (let i = 1; i <= 9; i++) {
      defaultMap[i] = null;
    }
    return defaultMap;
  });

  const [copied, setCopied] = useState(false);

  // Toggle status with standard validation bounds
  const handleToggle = (id: number, statusType: 'solide' | 'consolider') => {
    setStatuses(prev => {
      const current = prev[id];
      const nextValue = current === statusType ? null : statusType;
      const newStatuses = { ...prev, [id]: nextValue };
      
      // Save progress dynamically in the requested representation key (array)
      const saveArray = DELIVERABLES.map(item => ({
        id: item.id,
        status: newStatuses[item.id]
      }));
      localStorage.setItem('checklist_livrables_nexia_v1', JSON.stringify(saveArray));
      return newStatuses;
    });
  };

  // Reset function with confirm trigger
  const handleReset = () => {
    const confirm = window.confirm("Réinitialiser tous les statuts ?");
    if (confirm) {
      const resetMap: Record<number, 'solide' | 'consolider' | null> = {};
      for (let i = 1; i <= 9; i++) {
        resetMap[i] = null;
      }
      setStatuses(resetMap);
      localStorage.removeItem('checklist_livrables_nexia_v1');
    }
  };

  // Copy formatting engine
  const handleCopyText = async () => {
    const lines = [
      "=== PANORAMA DES 9 LIVRABLES NEXIA - ÉTAT DES LIEUX ===",
      `Apprenant : lucille@1001parcours.fr`,
      `Généré le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      "--------------------------------------------------",
      ""
    ];
    
    DELIVERABLES.forEach(item => {
      const statusVal = statuses[item.id];
      const statusText = statusVal === 'solide' ? 'Solide ✓' : statusVal === 'consolider' ? 'À consolider ◎' : 'Non évalué -';
      lines.push(`Livrable N°${item.id} [${item.competencies.join(', ')}] : ${item.label}`);
      lines.push(`↳ Statut : ${statusText}`);
      lines.push("");
    });
    
    const totalVal = Object.values(statuses).filter(s => s !== null).length;
    const solidsVal = Object.values(statuses).filter(s => s === 'solide').length;
    const consolidatesVal = Object.values(statuses).filter(s => s === 'consolider').length;
    
    lines.push("--------------------------------------------------");
    lines.push(`Bilan final : ${totalVal}/9 livrables évalués`);
    lines.push(`- ✓ Solide(s) : ${solidsVal}`);
    lines.push(`- ◎ À consolider : ${consolidatesVal}`);
    lines.push("--------------------------------------------------");
    
    const textToCopy = lines.join("\n");
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback copy paste action
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error("Copy paste failure", e);
      }
      document.body.removeChild(textArea);
    }
  };

  // Statics
  const totalEvaluated = Object.values(statuses).filter(s => s !== null).length;
  const solidCount = Object.values(statuses).filter(s => s === 'solide').length;
  const consolidateCount = Object.values(statuses).filter(s => s === 'consolider').length;
  const progressPercent = (totalEvaluated / 9) * 100;

  return (
    <div className="min-h-screen bg-[#F9F9FB] py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900 selection:bg-pink-100 selection:text-[#d41875]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Row */}
        <div className="flex flex-row items-center justify-end">
          <div className="text-right">
            <h1 className="text-[#d41875] text-lg sm:text-l font-bold uppercase tracking-tight">Panorama des 9 livrables</h1>
            <p className="text-slate-500 text-[10px] sm:text-xs font-semibold">Auto-évaluation NEXIA</p>
          </div>
        </div>

        {/* Title Presentation Board */}
        <div className="bg-white border border-gray-200/80 rounded-[10px] p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#d41875]"></div>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d41875] tracking-wider uppercase">
                <GraduationCap size={16} />
                <span>Activités interactives NEXIA</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                État des lieux de vos compétences
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                Utilisez ce tableau interactif pour cartographier l&apos;avancement des livrables de votre dossier NEXIA. Suivez vos forces collectives et ciblez les axes à consolider.
              </p>
            </div>
            
            {/* Action buttons list */}
            <div className="flex items-center gap-2 shrink-0 md:pt-4 self-stretch sm:self-auto justify-end">
              <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 py-1.5 px-3 rounded-md text-xs font-medium text-slate-500 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
                <span>Session : <span className="font-semibold text-slate-700">lucille@1001parcours.fr</span></span>
              </div>
            </div>
          </div>

          {/* Dynamic Progress Indicator Container - Geometric Balance Theme */}
          <div className="mt-6 border-t border-gray-150 pt-5">
            <div className="flex items-end justify-between mb-2">
              <span className="text-[#d41875] font-bold text-xs sm:text-sm uppercase tracking-wide">
                {totalEvaluated} / 9 livrables évalués
              </span>
              <div className="flex gap-4">
                <span className="text-[11px] font-bold text-[#22c55e] flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100">
                  ✓ {solidCount} Solide
                </span>
                <span className="text-[11px] font-bold text-[#f97316] flex items-center gap-1 bg-[#fff7ed] px-2 py-0.5 rounded-sm border border-orange-100">
                  ◎ {consolidateCount} À consolider
                </span>
              </div>
            </div>

            {/* Progress bar and indicators */}
            <div className="w-full h-3 bg-gray-100 rounded-full border border-gray-100 overflow-hidden relative">
              <div 
                className="h-full bg-[#d41875] rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(212,24,117,0.4)]"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={totalEvaluated}
                aria-valuemin={0}
                aria-valuemax={9}
                aria-label="Progression de l'auto-évaluation"
              />
            </div>
          </div>
        </div>

        {/* Semantic Responsive Multi-device Table - Geometric Balance layout */}
        <div className="bg-white md:border md:border-gray-200 md:rounded-[10px] md:shadow-sm overflow-hidden">
          
          {/* Main Desktop & Tablet Semantic Web Table & Mobile Stack Cards */}
          <div className="w-full">
            <table className="w-full block md:table text-left table-fixed">
              <thead className="hidden md:table-header-group bg-[#d41875] text-white">
                <tr>
                  <th scope="col" className="w-[8%] py-3 text-center text-[10px] font-bold uppercase tracking-[0.1em] border-r border-white/20">
                    Numéro
                  </th>
                  <th scope="col" className="w-[50%] py-3 px-4 text-[10px] font-bold uppercase tracking-[0.1em] border-r border-white/20">
                    Livrables NEXIA
                  </th>
                  <th scope="col" className="w-[15%] py-3 text-center text-[10px] font-bold uppercase tracking-[0.1em] border-r border-white/20">
                    Compétence
                  </th>
                  <th scope="col" className="w-[27%] py-3 text-center text-[10px] font-bold uppercase tracking-[0.1em]">
                    Je me sens…
                  </th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group divide-y divide-gray-150">
                {DELIVERABLES.map((item) => {
                  const currentStatus = statuses[item.id];
                  
                  // Background row selection
                  let rowBgClass = "bg-white hover:bg-neutral-50/50";
                  if (currentStatus === 'solide') {
                    rowBgClass = "bg-[#f0fdf4] hover:bg-[#e6fbf0]";
                  } else if (currentStatus === 'consolider') {
                    rowBgClass = "bg-[#fff7ed] hover:bg-[#fff2e0]";
                  }

                  return (
                    <tr 
                      key={item.id}
                      className={`block md:table-row p-4 mb-4 border border-gray-200 rounded-[10px] md:border-0 md:rounded-none transition-colors duration-300 ease-in-out ${rowBgClass}`}
                    >
                      {/* Cell 1: Number (Side-by-side label on mobile, normal cell on desktop with border-right) */}
                      <td className="flex justify-between items-center md:table-cell p-2 md:p-3 text-left md:text-center align-middle font-bold text-gray-700 text-xs sm:text-sm md:border-r md:border-gray-100 border-b border-gray-100/50 md:border-b-0 pb-3 md:pb-3">
                        <span className="md:hidden text-xs text-gray-400 font-bold uppercase tracking-wider">Livrable</span>
                        <span className="bg-slate-100/80 text-slate-800 md:bg-transparent md:text-inherit px-2 sm:px-2.5 py-0.5 rounded-sm text-xs sm:text-sm font-extrabold">N°{item.id}</span>
                      </td>

                      {/* Cell 2: Deliverable Description (Stacks vertically) */}
                      <td className="block md:table-cell p-2 md:p-3 align-middle pt-3 md:pt-3">
                        <div className="flex flex-col gap-2">
                          <label 
                            htmlFor={`livrable-fieldset-${item.id}`} 
                            className="font-medium text-slate-700 text-xs sm:text-sm leading-relaxed"
                          >
                            {item.label}
                          </label>

                          {/* Dynamic layout transition badge */}
                          <div className="min-h-[20px] flex items-center">
                            <AnimatePresence mode="wait">
                              {currentStatus === 'solide' && (
                                <motion.span
                                  key="solide-badge"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.15 }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]"
                                >
                                  <CheckCircle2 size={11} className="stroke-[2.5]" />
                                  <span>LIVRABLE SOLIDE</span>
                                </motion.span>
                              )}
                              {currentStatus === 'consolider' && (
                                <motion.span
                                  key="consolider-badge"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.15 }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#ffedd5] text-[#9a3412] border border-[#fed7aa]"
                                >
                                  <AlertCircle size={11} className="stroke-[2.5]" />
                                  <span>À CONSOLIDER</span>
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>

                      {/* Cell 3: Competencies (Center aligned with border-right on desktop) */}
                      <td className="flex justify-between items-center md:table-cell p-2 md:p-3 text-left md:text-center align-middle md:border-r md:border-gray-100 border-t border-b border-dashed border-gray-100 md:border-none py-3 md:py-3">
                        <span className="md:hidden text-xs text-slate-400 font-bold uppercase tracking-wider">Référentiel</span>
                        <div className="flex gap-1 justify-center flex-wrap">
                          {item.competencies.map(comp => (
                            <span 
                              key={comp} 
                              className="px-2 py-0.5 bg-[#fce7f3] text-[#d41875] rounded-full font-bold text-[10px]"
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Cell 4: Buttons (Styled as the Geometric Balance grid style toggle buttons) */}
                      <td className="block md:table-cell p-2 md:p-1.5 align-middle pt-3 md:pt-1.5">
                        <fieldset 
                          id={`livrable-fieldset-${item.id}`}
                          role="group" 
                          className="w-full"
                        >
                          <legend className="sr-only">
                            Évaluez votre sentiment d&apos;avancement pour le livrable {item.id} - {item.label}
                          </legend>
                          
                          <div className="flex gap-2 justify-center md:justify-center items-center h-full">
                            {/* Option 1: Solide Button */}
                            <button
                              type="button"
                              onClick={() => handleToggle(item.id, 'solide')}
                              aria-pressed={currentStatus === 'solide'}
                              aria-label={`N°${item.id} — ${item.label} : Solide`}
                              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-md transition-all duration-150 cursor-pointer border ${
                                currentStatus === 'solide'
                                  ? 'bg-[#22c55e] border-[#22c55e] text-white shadow-sm font-bold'
                                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-[#f0fdf4] hover:border-emerald-200 hover:text-emerald-700 font-semibold'
                              }`}
                            >
                              {currentStatus === 'solide' && <CheckCircle2 size={12} className="stroke-[2.5]" />}
                              <span>Solide</span>
                            </button>

                            {/* Option 2: À consolider Button */}
                            <button
                              type="button"
                              onClick={() => handleToggle(item.id, 'consolider')}
                              aria-pressed={currentStatus === 'consolider'}
                              aria-label={`N°${item.id} — ${item.label} : À consolider`}
                              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-md transition-all duration-150 cursor-pointer border ${
                                currentStatus === 'consolider'
                                  ? 'bg-[#f97316] border-[#f97316] text-white shadow-sm font-bold'
                                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-[#fff7ed] hover:border-amber-200 hover:text-amber-700 font-semibold'
                              }`}
                            >
                              {currentStatus === 'consolider' && <AlertCircle size={12} className="stroke-[2.5]" />}
                              <span>À consolider</span>
                            </button>
                          </div>
                        </fieldset>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer segment with dynamic statistics summary and physical restarter */}
          <div className="bg-gray-50/70 border-t border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-start gap-2 max-w-sm sm:max-w-md">
              <HelpCircle size={16} className="text-gray-400 shrink-0 mt-0.5" />
              <p className="text-[11px] sm:text-xs text-gray-500 leading-normal">
                Les choix effectués sont stockés sur votre navigateur de manière autonome et sécurisée. Vous pouvez à tout moment exporter votre auto-évaluation ou reprendre la formation.
              </p>
            </div>
            
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-red-700 font-bold bg-white active:bg-gray-100 py-2 px-4 border border-gray-200 rounded-lg shadow-2xs hover:border-red-200 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              aria-label="Réinitialiser l'auto-évaluation à zéro"
            >
              <RotateCcw size={13} />
              <span>Réinitialiser les statuts</span>
            </button>
          </div>
        </div>

        {/* Dynamic Mobile Layout Reminder Block */}
        <div className="md:hidden text-center text-xs text-gray-400 pt-2 font-medium">
          💡 Faites défiler horizontalement ou pivotez votre appareil pour voir l&apos;ensemble des détails d&apos;auto-évaluation.
        </div>
      </div>
    </div>
  );
}

