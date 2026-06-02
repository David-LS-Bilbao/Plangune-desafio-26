import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateOffer() {
  const navigate = useNavigate();
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setOfferData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSendReview = () => {
    setStatusMessage(
      "Oferta enviada a revisión. Recibirás notificación cuando esté aprobada.",
    );
  };

  const handleSaveDraft = () => {
    setStatusMessage(
      "Borrador guardado. Puedes volver a editarlo cuando quieras.",
    );
  };

  const handleBack = () => {
    navigate("/negocio/dashboard");
  };

  return (
    <main className="create-offer-main">
      <div className="offer-header-simple">
        <button
          className="btn-icon-round"
          aria-label="Volver"
          type="button"
          onClick={handleBack}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="header-title truncate">Crear Oferta</h1>
        <div className="header-status hidden md:flex">
          <span className="badge-draft">Borrador</span>
        </div>
      </div>

      <form className="offer-form" onSubmit={(e) => e.preventDefault()}>
        {/* Left Column: Primary Content & Media */}
        <div className="left-column">
          {/* Media Upload Bento Card */}
          <section className="media-upload-section group">
            <div className="upload-container">
              <span className="material-symbols-outlined icon-upload group-hover:text-primary fill">
                add_photo_alternate
              </span>
              <div className="upload-text">
                <p className="primary-text">Subir Imagen de Portada</p>
                <p className="secondary-text">
                  PNG, JPG, o WEBP (Recomendado: 16:9, max 5MB)
                </p>
              </div>
              <div className="gradient-blob"></div>
            </div>
          </section>

          <section className="core-info-section">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Título de la oferta
              </label>
              <input
                type="text"
                id="title"
                className="form-input"
                placeholder="Ej: 20% Dto en Taller de Cerámica Familiar"
                value={offerData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Descripción
              </label>
              <textarea
                id="description"
                rows="4"
                className="form-textarea"
                placeholder="Explica en qué consiste la oferta, qué incluye y por qué es genial para las familias..."
                value={offerData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="conditions" className="form-label">
                Condiciones del servicio
              </label>
              <textarea
                id="conditions"
                rows="3"
                className="form-textarea text-sm"
                placeholder="Restricciones de edad, necesidad de reserva previa, días excluidos..."
                value={offerData.conditions}
                onChange={handleChange}
              />
            </div>
          </section>
        </div>

        <div className="right-column">
          <div className="sticky-wrapper">
            <section className="config-section">
              <h2 className="section-title">Configuración</h2>

              <div className="form-group">
                <label htmlFor="associatedActivity" className="form-label">
                  Actividad asociada
                </label>
                <div className="input-with-icon">
                  <select
                    id="associatedActivity"
                    className="form-select"
                    value={offerData.associatedActivity}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Selecciona una actividad activa
                    </option>
                    <option value="Taller de Cerámica Familiar (Sábados)">
                      Taller de Cerámica Familiar (Sábados)
                    </option>
                    <option value="Ruta Guiada por el Bosque Mágico">
                      Ruta Guiada por el Bosque Mágico
                    </option>
                    <option value="Clase de Surf para Principiantes">
                      Clase de Surf para Principiantes
                    </option>
                  </select>
                  <span className="material-symbols-outlined icon">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="offerType" className="form-label">
                  Tipo de oferta
                </label>
                <div className="input-with-icon">
                  <select
                    id="offerType"
                    className="form-select"
                    value={offerData.offerType}
                    onChange={handleChange}
                  >
                    <option value="discount">Descuento (%)</option>
                    <option value="fixed_amount">Importe Fijo (€)</option>
                    <option value="bogo">2x1</option>
                    <option value="gift">Regalo con reserva</option>
                  </select>
                  <span className="material-symbols-outlined icon">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="promoCode" className="form-label mb-0">
                    Código promocional
                  </label>
                  <span className="label-optional">Opcional</span>
                </div>
                <div className="input-with-icon left-icon">
                  <span className="material-symbols-outlined icon-left">
                    sell
                  </span>
                  <input
                    type="text"
                    id="promoCode"
                    className="form-input pl-10 uppercase-placeholder"
                    placeholder="TXIKI20"
                    value={offerData.promoCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <section className="validity-section">
              <h2 className="section-title">Vigencia</h2>
              <div className="grid-2-cols">
                <div className="form-group">
                  <label htmlFor="startDate" className="form-label">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    className="form-input"
                    value={offerData.startDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate" className="form-label">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    className="form-input"
                    value={offerData.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <div className="admin-notice">
              <span className="material-symbols-outlined fill text-secondary mt-0.5">
                info
              </span>
              <p className="notice-text">
                Las ofertas deben ser revisadas por admin antes de publicarse
                para garantizar la calidad del servicio en TxikiPlan.
              </p>
            </div>

            <div className="desktop-actions hidden lg:flex">
              <button
                type="button"
                className="btn-primary-icon"
                onClick={handleSendReview}
              >
                <span className="material-symbols-outlined text-lg">send</span>
                Enviar a revisión
              </button>
              <button
                type="button"
                className="btn-outline-icon"
                onClick={handleSaveDraft}
              >
                <span className="material-symbols-outlined text-lg">save</span>
                Guardar borrador
              </button>
            </div>
          </div>
        </div>
      </form>

      {statusMessage && (
        <div className="status-message-container">
          <p className="status-message">{statusMessage}</p>
        </div>
      )}

      <div className="mobile-fixed-actions lg:hidden">
        <button
          type="button"
          className="btn-outline flex-1 truncate"
          onClick={handleSaveDraft}
        >
          Guardar borrador
        </button>
        <button
          type="button"
          className="btn-primary flex-1 truncate"
          onClick={handleSendReview}
        >
          Enviar a revisión
        </button>
      </div>
    </main>
  );
}

export default CreateOffer;
