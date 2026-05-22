export const translations = {
  en: {
    wallTitlePre: "Loved by clients of ",
    wallTitlePost: "",
    wallSubtitle: "Real stories, transcripts, and measurable results from real people.",
    ownerMode: "Owner Mode:",
    ownerPreview: "You are previewing your Wall of Proof.",
    backToDashboard: "Back to Dashboard",
    noTestimonials: "No testimonials featured yet",
    noTestimonialsDesc: "Select the \"Feature on Wall\" checkbox in your dashboard to showcase client wins here.",
    formWelcomeTextDefault: "Please share your experience working with us below.",
    formThankYouTextDefault: "We have received your testimonial. We really appreciate your feedback!",
    clientNameLabel: "Your Name",
    clientRoleLabel: "Your Role / Title",
    testimonialLabel: "Your Testimonial",
    testimonialHint: "What was it like working with us? What was the biggest benefit?",
    metricLabel: "Core Result / Metric (Optional)",
    metricHint: "Did you achieve a specific measurable result? (e.g. +30% revenue)",
    consentLabel: "I allow my name to be displayed publicly",
    submitButton: "Submit Testimonial",
    submitting: "Submitting...",
    successHeader: "Thank You!",
    loading: "Loading...",
    formNotFound: "Form not found or unavailable.",
    failedToSubmit: "Failed to submit testimonial. Please try again.",
    networkError: "Network error.",
    resultLabel: "Result",
    anonymous: "Anonymous",
    clientDefault: "Client",
    videoTestimonial: "Video testimonial",
    averageRating: "Average rating",
    testimonialsCount: "testimonials"
  },
  es: {
    wallTitlePre: "Valorado por los clientes de ",
    wallTitlePost: "",
    wallSubtitle: "Historias reales, transcripciones y resultados medibles de personas reales.",
    ownerMode: "Modo Propietario:",
    ownerPreview: "Estás previsualizando tu Muro de Pruebas.",
    backToDashboard: "Volver al Panel",
    noTestimonials: "Aún no hay testimonios destacados",
    noTestimonialsDesc: "Selecciona la casilla \"Destacar en el Muro\" en tu panel para mostrar los logros de los clientes aquí.",
    formWelcomeTextDefault: "Por favor, comparte tu experiencia de trabajo con nosotros a continuación.",
    formThankYouTextDefault: "Hemos recibido tu testimonio. ¡Agradecemos mucho tus comentarios!",
    clientNameLabel: "Tu Nombre",
    clientRoleLabel: "Tu Rol / Cargo",
    testimonialLabel: "Tu Testimonio",
    testimonialHint: "¿Cómo fue trabajar con nosotros? ¿Cuál fue el mayor beneficio?",
    metricLabel: "Resultado Clave / Métrica (Opcional)",
    metricHint: "¿Lograste algún resultado medible específico? (ej. +30% de ingresos)",
    consentLabel: "Permito que mi nombre se muestre públicamente",
    submitButton: "Enviar Testimonio",
    submitting: "Enviando...",
    successHeader: "¡Gracias!",
    loading: "Cargando...",
    formNotFound: "Formulario no encontrado o no disponible.",
    failedToSubmit: "Error al enviar el testimonio. Por favor, inténtalo de nuevo.",
    networkError: "Error de red.",
    resultLabel: "Resultado",
    anonymous: "Anónimo",
    clientDefault: "Cliente",
    videoTestimonial: "Testimonio en video",
    averageRating: "Calificación promedio",
    testimonialsCount: "testimonios"
  },
  hi: {
    wallTitlePre: "",
    wallTitlePost: " के ग्राहकों द्वारा सराहा गया",
    wallSubtitle: "असली लोगों से वास्तविक कहानियाँ, ट्रांसक्रिप्ट और मापने योग्य परिणाम।",
    ownerMode: "ओनर मोड:",
    ownerPreview: "आप अपने वॉल ऑफ प्रूफ का पूर्वावलोकन कर रहे हैं।",
    backToDashboard: "डैशबोर्ड पर वापस जाएं",
    noTestimonials: "अभी तक कोई टेस्टिमोनियल शामिल नहीं किया गया है",
    noTestimonialsDesc: "यहाँ ग्राहकों की जीत दिखाने के लिए अपने डैशबोर्ड में \"Feature on Wall\" चेकबॉक्स को चुनें।",
    formWelcomeTextDefault: "कृपया नीचे हमारे साथ काम करने का अपना अनुभव साझा करें।",
    formThankYouTextDefault: "हमें आपका टेस्टिमोनियल मिल गया है। हम आपकी प्रतिक्रिया की वास्तव में सराहना करते हैं!",
    clientNameLabel: "आपका नाम",
    clientRoleLabel: "आपकी भूमिका / पद",
    testimonialLabel: "आपका टेस्टिमोनियल",
    testimonialHint: "हमारे साथ काम करने का अनुभव कैसा रहा? सबसे बड़ा लाभ क्या था?",
    metricLabel: "मुख्य परिणाम / मीट्रिक (वैकल्पिक)",
    metricHint: "क्या आपने कोई विशिष्ट मापने योग्य परिणाम प्राप्त किया? (उदा. +30% राजस्व)",
    consentLabel: "मैं अपना नाम सार्वजनिक रूप से प्रदर्शित करने की अनुमति देता/देती हूँ",
    submitButton: "टेस्टिमोनियल सबमिट करें",
    submitting: "सबमिट हो रहा है...",
    successHeader: "धन्यवाद!",
    loading: "लोड हो रहा है...",
    formNotFound: "फ़ॉर्म नहीं मिला या अनुपलब्ध है।",
    failedToSubmit: "टेस्टिमोनियल सबमिट करने में विफल। कृपया पुन: प्रयास करें।",
    networkError: "नेटवर्क त्रुटि।",
    resultLabel: "परिणाम",
    anonymous: "अनाम",
    clientDefault: "ग्राहक",
    videoTestimonial: "वीडियो टेस्टिमोनियल",
    averageRating: "औसत रेटिंग",
    testimonialsCount: "टेस्टिमोनियल"
  }
};

export type LanguageCode = 'en' | 'es' | 'hi';
export type TranslationSet = typeof translations.en;

export function getTranslations(lang?: string | null): TranslationSet {
  const code = (lang || 'en').toLowerCase() as LanguageCode;
  if (code === 'es') return translations.es;
  if (code === 'hi') return translations.hi;
  return translations.en;
}

export function t(key: string, lang?: string | null, replacements?: Record<string, string>): string {
  const transSet = getTranslations(lang);
  let value = (transSet as any)[key] || (translations.en as any)[key] || key;
  if (replacements && typeof value === 'string') {
    Object.entries(replacements).forEach(([k, v]) => {
      value = value.replace(new RegExp(`{${k}}`, 'g'), v);
    });
  }
  return value;
}
