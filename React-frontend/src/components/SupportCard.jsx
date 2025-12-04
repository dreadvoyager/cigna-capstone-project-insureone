import { Phone, Mail, MapPin, Clock, X } from "lucide-react";

const SupportCard = ({ info, onClose }) => {
  return (
    <div className="rounded-2xl bg-white border border-slate-300 p-8 shadow-xl animate-fadeIn relative">

  
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
      >
        <X className="h-5 w-5" />
      </button>

      <h3 className="text-2xl font-bold text-slate-900 mb-6">Contact Support</h3>

      <div className="space-y-4 text-slate-700">
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-emerald-600" />
          <span className="font-medium">{info.phone}</span>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-emerald-600" />
          <span className="font-medium">{info.email}</span>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-emerald-600" />
          <span className="font-medium">{info.address}</span>
        </div>

        {info.hours && (
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-emerald-600" />
            <span className="font-medium">{info.hours}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportCard;
