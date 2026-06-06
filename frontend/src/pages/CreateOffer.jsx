import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessStore } from "../store";

function CreateOffer() {
  const navigate = useNavigate();
  const addOffer = useBusinessStore((state) => state.addOffer);
  const [offerData, setOfferData] = useState({
    title: "",
    description: "",
    conditions: "",
    associatedActivity: "",
    offerType: "discount",
    promoCode: "",
    startDate: "",
    endDate: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setOfferData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSendReview = () => {
    addOffer({
      title: offerData.title,
      description: offerData.description,
      activity: offerData.associatedActivity || "Actividad General",
      icon: "local_offer",
      meta: offerData.promoCode ? `Código: ${offerData.promoCode}` : "Sin código",
      status: "pending",
    });
    setStatusMessage("Oferta enviada a revisión. Redirigiendo...");
    setTimeout(() => navigate("/negocio/ofertas"), 1500);
  };

  const handleSaveDraft = () => {
    setStatusMessage("Borrador guardado. Puedes volver a editarlo cuando quieras.");
  };

  return (
    <main className="biz-dashboard-main">

      <div className="biz-dashboard-header">
        <h1 className="biz-dashboard-title">Gestionar oferta</h1>
        <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
          Volver atrás
        </button>
      </div>

      <form className="create-offer-form" onSubmit={(e) => e.preventDefault()}>

        {/* Columna izquierda */}
        <div className="create-offer-left">

          {/* Imagen de portada */}
          <section className="biz-activity-form create-offer-media" onClick={() => fileInputRef.current.click()}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setCoverImage(URL.createObjectURL(file));
              }}
            />
            {coverImage ? (
              <img src={coverImage} alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.8rem' }} />
            ) : (
              <div className="create-offer-upload">
                <span className="material-symbols-outlined">add_photo_alternate</span>
                <p className="create-offer-upload__primary">Subir imagen de portada</p>
                <p className="create-offer-upload__secondary">PNG, JPG o WEBP · Recomendado 16:9 · Máx. 5MB</p>
              </div>
            )}
          </section>

          {/* Información principal */}
          <section className="biz-activity-form">
            <h2 className="biz-panel__title">Información principal</h2>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="title">Título de la oferta</label>
              <input type="text" id="title" className="biz-input" placeholder="Ej: 20% Dto en Taller de Cerámica Familiar" value={offerData.title} onChange={handleChange} />
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="description">Descripción</label>
              <textarea id="description" className="biz-input create-offer-textarea" rows="4"
                placeholder="Explica en qué consiste la oferta, qué incluye y por qué es genial para las familias..."
                value={offerData.description} onChange={handleChange}
              />
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="conditions">Condiciones del servicio</label>
              <textarea id="conditions" className="biz-input create-offer-textarea" rows="3"
                placeholder="Restricciones de edad, necesidad de reserva previa, días excluidos..."
                value={offerData.conditions} onChange={handleChange}
              />
            </div>
          </section>
        </div>

        {/* Columna derecha */}
        <div className="create-offer-right">
          <div className="create-offer-sticky">

            <section className="biz-activity-form">
              <h2 className="biz-panel__title">Configuración</h2>

              <div className="create-family-form__group">
                <label className="section-label biz-label" htmlFor="associatedActivity">Actividad asociada</label>
                <select id="associatedActivity" className="biz-input" value={offerData.associatedActivity} onChange={handleChange}>
                  <option value="" disabled>Selecciona una actividad activa</option>
                  <option value="Taller de Cerámica Familiar (Sábados)">Taller de Cerámica Familiar (Sábados)</option>
                  <option value="Ruta Guiada por el Bosque Mágico">Ruta Guiada por el Bosque Mágico</option>
                  <option value="Clase de Surf para Principiantes">Clase de Surf para Principiantes</option>
                </select>
              </div>

              <div className="create-family-form__group">
                <label className="section-label biz-label" htmlFor="offerType">Tipo de oferta</label>
                <select id="offerType" className="biz-input" value={offerData.offerType} onChange={handleChange}>
                  <option value="discount">Descuento (%)</option>
                  <option value="fixed_amount">Importe fijo (€)</option>
                  <option value="bogo">2x1</option>
                  <option value="gift">Regalo con reserva</option>
                </select>
              </div>

              <div className="create-family-form__group">
                <label className="section-label biz-label" htmlFor="promoCode">
                  Código promocional
                  <span className="create-offer-optional">Opcional</span>
                </label>
                <input type="text" id="promoCode" className="biz-input" placeholder="TXIKI20" value={offerData.promoCode} onChange={handleChange} />
              </div>
            </section>

            <section className="biz-activity-form">
              <h2 className="biz-panel__title">Vigencia</h2>

              <div className="create-offer-dates">
                <div className="create-family-form__group">
                  <label className="section-label biz-label" htmlFor="startDate">Fecha inicio</label>
                  <input type="date" id="startDate" className="biz-input" value={offerData.startDate} onChange={handleChange} />
                </div>
                <div className="create-family-form__group">
                  <label className="section-label biz-label" htmlFor="endDate">Fecha fin</label>
                  <input type="date" id="endDate" className="biz-input" value={offerData.endDate} onChange={handleChange} />
                </div>
              </div>
            </section>

            <div className="biz-activity-form create-offer-notice">
              <span className="material-symbols-outlined fill" style={{ color: 'var(--accent-color)', fontSize: '1.5rem' }}>info</span>
              <p>Las ofertas deben ser revisadas por el equipo de Plangune antes de publicarse.</p>
            </div>

            <div className="create-offer-actions">
              <button type="button" className="btn-primary" onClick={handleSendReview}>
                <span className="material-symbols-outlined">send</span>
                Enviar a revisión
              </button>
              <button type="button" className="btn-text-danger" onClick={handleSaveDraft}>
                <span className="material-symbols-outlined">save</span>
                Guardar borrador
              </button>
            </div>

            {statusMessage && <p className="status-message">{statusMessage}</p>}
          </div>
        </div>

      </form>
    </main>
  );
}

export default CreateOffer;
