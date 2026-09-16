import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { MapPin as MapPinIcon, Camera as CameraIcon, Image as ImageIconLucide, Navigation, Sparkles, Building, Map as MapIcon, ChevronRight, X } from 'lucide-react';
import { useAppContext, SignalType } from '../../context/AppContext';
import { REPORT_PLACEHOLDER_IMG } from '../../components/figma/ReportImage';

const CATEGORIES = {
  'Espace public': [
    {
      name: 'Voirie',
      subs: ['Nid de poule', 'Trottoir endommagé', 'Signalisation manquante', 'Autre']
    },
    {
      name: 'Éclairage public',
      subs: ['Panne d\'éclairage', 'Lampadaire clignotant', 'Autre']
    },
    {
      name: 'Gestion de l\'eau',
      subs: ['Fuite sur la voie', 'Bouche d\'égout bouchée', 'Autre']
    },
    {
      name: 'Propreté',
      subs: ['Dépôt sauvage', 'Poubelle pleine', 'Autre']
    }
  ],
  'Bâtiment communal': [
    {
      name: 'École',
      subs: ['Plomberie', 'Électricité', 'Chauffage', 'Dégradation matérielle']
    },
    {
      name: 'Mairie / Bureau',
      subs: ['Plomberie', 'Électricité', 'Climatisation', 'Autre']
    },
    {
      name: 'Complexe sportif',
      subs: ['Matériel endommagé', 'Vestiaires', 'Autre']
    }
  ]
};

export default function NewReport() {
  const { addReport } = useAppContext();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    signalType: 'Espace public' as SignalType,
    category: '',
    subCategory: '',
    description: '',
    location: '',
    imageUrl: ''
  });

  const handleImagePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Aperçu immédiat en local (fonctionne hors-ligne, sans CDN)
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, imageUrl: previewUrl }));
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.category) return;
      setStep(2);
      return;
    }

    setLoading(true);

    // Mock sending process
    setTimeout(() => {
      addReport({
        ...formData,
        citizenId: 'CIT-123',
        imageUrl: formData.imageUrl || REPORT_PLACEHOLDER_IMG,
      });
      navigate('/citizen/history');
    }, 2000);
  };

  const handleGetLocation = () => {
    setFormData(prev => ({ ...prev, location: 'Avenue des Champs-Élysées, Paris' }));
  };

  const availableCategories = CATEGORIES[formData.signalType];
  const selectedCategoryObj = availableCategories.find(c => c.name === formData.category);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center bg-blue-600 h-full min-h-[600px] text-white p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <Sparkles className="w-16 h-16 animate-pulse mb-6 text-blue-200 relative z-10" />
        <h2 className="text-2xl font-bold mb-4 relative z-10">Transmission en cours...</h2>
        <p className="text-blue-100 mb-8 relative z-10 max-w-sm">
          Notre système achemine directement votre signalement au <strong>service technique concerné</strong> en fonction de la catégorie choisie.
        </p>
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-50 min-h-full pb-20">
      <header className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nouveau signalement</h1>
          <p className="text-sm text-slate-500 mt-1">Étape {step} sur 2</p>
        </div>
        {step === 2 && (
          <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
            Retour
          </button>
        )}
      </header>

      <div className="px-6 py-3 flex gap-2">
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
        
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Type de lieu */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Où se situe le problème ?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({...formData, signalType: 'Espace public', category: '', subCategory: ''});
                  }}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                    formData.signalType === 'Espace public' 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <MapIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm font-bold">Espace public</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({...formData, signalType: 'Bâtiment communal', category: '', subCategory: ''});
                  }}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                    formData.signalType === 'Bâtiment communal' 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-8 h-8 mb-2" />
                  <span className="text-sm font-bold text-center">Bâtiment communal</span>
                </button>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Catégorie</label>
              <select 
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value, subCategory: ''})}
                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium text-slate-700 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em' }}
              >
                <option value="" disabled>Sélectionner une catégorie</option>
                {availableCategories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Sub-Category */}
            {selectedCategoryObj && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-semibold text-slate-700">Précisez le problème</label>
                <select 
                  required
                  value={formData.subCategory}
                  onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium text-slate-700 appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em' }}
                >
                  <option value="" disabled>Détail...</option>
                  {selectedCategoryObj.subs.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            <button 
              type="submit"
              disabled={!formData.category || !formData.subCategory}
              className="w-full mt-8 bg-blue-600 disabled:bg-blue-300 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex justify-center items-center"
            >
              Suivant <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Photo Upload */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Photo (Optionnelle)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImagePicked}
                className="hidden"
                id="report-image"
              />
              {formData.imageUrl ? (
                <div className="relative">
                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-200">
                    <img src={formData.imageUrl} alt="Aperçu du signalement" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1.5 bg-slate-900/70 text-white rounded-full hover:bg-slate-900 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-slate-400 mt-1">Image sélectionnée (aperçu local). Le rendu sera adapté côté serveur.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <label
                    htmlFor="report-image"
                    className="flex flex-col items-center justify-center p-6 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 hover:bg-blue-100 cursor-pointer transition-colors"
                  >
                    <CameraIcon className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Appareil photo</span>
                  </label>
                  <label
                    htmlFor="report-image"
                    className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <ImageIconLucide className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Galerie</span>
                  </label>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Description détaillée</label>
              <textarea 
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Décrivez l'anomalie rencontrée..."
                rows={4}
                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm resize-none text-slate-700"
              />
            </div>

            {/* Location Section */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                Localisation / Adresse
              </label>
              <div className="relative">
                <MapPinIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Saisir ou utiliser le GPS..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-slate-700 font-medium"
                />
              </div>
              <button 
                type="button" 
                onClick={handleGetLocation}
                className="w-full mt-2 flex items-center justify-center bg-slate-800 text-white text-sm font-semibold px-4 py-3 rounded-xl active:scale-[0.98] transition-transform"
              >
                <Navigation className="w-4 h-4 mr-2" /> Me géolocaliser automatiquement
              </button>
            </div>

            <button 
              type="submit"
              disabled={!formData.location || !formData.description}
              className="w-full mt-8 bg-emerald-600 disabled:bg-emerald-300 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all flex justify-center items-center"
            >
              Envoyer le signalement
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
