import React from 'react';

function CreateOffer() {
  return (
    <main className="create-offer-main">
      <div className="offer-header-simple">
        <button className="btn-icon-round" aria-label="Volver">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="header-title truncate">Crear Oferta</h1>
        <div className="header-status hidden md:flex">
          <span className="badge-draft">Borrador</span>
        </div>
      </div>

      <form className="offer-form">
        {/* Left Column: Primary Content & Media */}
        <div className="left-column">
          {/* Media Upload Bento Card */}
          <section className="media-upload-section group">
            <div className="upload-container">
              <span className="material-symbols-outlined icon-upload group-hover:text-primary fill">add_photo_alternate</span>
              <div className="upload-text">
                <p className="primary-text">Subir Imagen de Portada</p>
                <p className="secondary-text">PNG, JPG, o WEBP (Recomendado: 16:9, max 5MB)</p>
              </div>
              {/* Decorative gradient blob */}
              <div className="gradient-blob"></div>
            </div>
          </section>

          {/* Core Information Card */}
          <section className="core-info-section">
            <div className="form-group">
              <label htmlFor="offer_title" className="form-label">Título de la oferta</label>
              <input type="text" id="offer_title" className="form-input" placeholder="Ej: 20% Dto en Taller de Cerámica Familiar" />
            </div>

            <div className="form-group">
              <label htmlFor="offer_description" className="form-label">Descripción</label>
              <textarea id="offer_description" rows="4" className="form-textarea" placeholder="Explica en qué consiste la oferta, qué incluye y por qué es genial para las familias..."></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="offer_conditions" className="form-label">Condiciones del servicio</label>
              <textarea id="offer_conditions" rows="3" className="form-textarea text-sm" placeholder="Restricciones de edad, necesidad de reserva previa, días excluidos..."></textarea>
            </div>
          </section>
        </div>

        {/* Right Column: Settings, Metadata & Actions */}
        <div className="right-column">
          <div className="sticky-wrapper">
            {/* Configuration Card */}
            <section className="config-section">
              <h2 className="section-title">Configuración</h2>
              
              <div className="form-group">
                <label htmlFor="associated_activity" className="form-label">Actividad asociada</label>
                <div className="input-with-icon">
                  <select id="associated_activity" className="form-select" defaultValue="">
                    <option value="" disabled>Selecciona una actividad activa</option>
                    <option value="1">Taller de Cerámica Familiar (Sábados)</option>
                    <option value="2">Ruta Guiada por el Bosque Mágico</option>
                    <option value="3">Clase de Surf para Principiantes</option>
                  </select>
                  <span className="material-symbols-outlined icon">expand_more</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="offer_type" className="form-label">Tipo de oferta</label>
                <div className="input-with-icon">
                  <select id="offer_type" className="form-select" defaultValue="discount">
                    <option value="discount">Descuento (%)</option>
                    <option value="fixed_amount">Importe Fijo (€)</option>
                    <option value="bogo">2x1</option>
                    <option value="gift">Regalo con reserva</option>
                  </select>
                  <span className="material-symbols-outlined icon">expand_more</span>
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="promo_code" className="form-label mb-0">Código promocional</label>
                  <span className="label-optional">Opcional</span>
                </div>
                <div className="input-with-icon left-icon">
                  <span className="material-symbols-outlined icon-left">sell</span>
                  <input type="text" id="promo_code" className="form-input pl-10 uppercase-placeholder" placeholder="TXIKI20" />
                </div>
              </div>
            </section>

            {/* Validity Period Card */}
            <section className="validity-section">
              <h2 className="section-title">Vigencia</h2>
              <div className="grid-2-cols">
                <div className="form-group">
                  <label htmlFor="start_date" className="form-label">Fecha inicio</label>
                  <input type="date" id="start_date" className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="end_date" className="form-label">Fecha fin</label>
                  <input type="date" id="end_date" className="form-input" />
                </div>
              </div>
            </section>

            {/* Admin Notice */}
            <div className="admin-notice">
              <span className="material-symbols-outlined fill text-secondary mt-0.5">info</span>
              <p className="notice-text">
                Las ofertas deben ser revisadas por admin antes de publicarse para garantizar la calidad del servicio en TxikiPlan.
              </p>
            </div>

            {/* Actions (Desktop View) */}
            <div className="desktop-actions hidden lg:flex">
              <button type="button" className="btn-primary-icon">
                <span className="material-symbols-outlined text-lg">send</span>
                Enviar a revisión
              </button>
              <button type="button" className="btn-outline-icon">
                <span className="material-symbols-outlined text-lg">save</span>
                Guardar borrador
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Mobile Fixed Bottom Actions */}
      <div className="mobile-fixed-actions lg:hidden">
        <button type="button" className="btn-outline flex-1 truncate">
          Guardar borrador
        </button>
        <button type="button" className="btn-primary flex-1 truncate">
          Enviar a revisión
        </button>
      </div>
    </main>
  );
}

export default CreateOffer;
