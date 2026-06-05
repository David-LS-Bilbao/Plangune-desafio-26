import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessStore } from "../store";

function OfferCard({ colorVariant, badge, badgeType, date, dateIcon, title, subtitle, location, onNavigate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`offer-user-card offer-user-card--${colorVariant}`}
      onClick={onNavigate}
    >
      <div className="offer-user-card__header">
        <span className={`offer-user-badge offer-user-badge--${badgeType}`}>{badge}</span>
        <span className="offer-user-date">
          <span className="material-symbols-outlined">{dateIcon}</span>
          {date}
        </span>
      </div>
      <h3 className="offer-user-card__title">{title}</h3>
      <div className="offer-user-card__subtitle">
        <p className={`offer-user-card__subtitle-text${expanded ? " expanded" : ""}`}>
          {subtitle}
        </p>
        {subtitle && subtitle.length > 120 && (
          <button
            className="offer-user-card__read-more"
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          >
            {expanded ? "Leer menos" : "Leer más"}
          </button>
        )}
      </div>
      <div className="offer-user-card__location">
        <span className="material-symbols-outlined">location_on</span>
        {location}
      </div>
      <button className="offer-user-card__btn" type="button">
        Ver oferta
      </button>
    </div>
  );
}

function OffersUser() {
  const navigate = useNavigate();
  const dynamicOffers = useBusinessStore((state) => state.offers);

  const staticOffers = [
    {
      id: "static-1",
      badge: "OFERTA",
      badgeType: "secondary",
      date: "Hasta 31 Oct",
      dateIcon: "calendar_today",
      title: "2x1 en menú infantil",
      subtitle: "Comida Familiar de Domingo",
      location: "Bilbao",
      planId: "/planes/1",
    },
    {
      id: "static-2",
      badge: "TALLER",
      badgeType: "primary",
      date: "Solo miércoles",
      dateIcon: "event",
      title: "Taller gratuito",
      subtitle: "Taller de Otoño Creativo",
      location: "Getxo",
      planId: "/planes/2",
    },
    {
      id: "static-3",
      badge: "ESPECIAL",
      badgeType: "accent",
      date: "Este fin de semana",
      dateIcon: "event",
      title: "Ruta en familia por la costa",
      subtitle: "Descubre los mejores miradores y playas accesibles con carrito de la costa vasca.",
      location: "Getxo · Costa",
      planId: "/planes/3",
    },
  ];

  const chessPattern = ["tertiary", "primary", "accent"];

  const allOffers = [
    ...dynamicOffers.filter((o) => o.status === "active").map((offer) => ({
      id: offer.id,
      badge: "OFERTA",
      badgeType: "primary",
      date: offer.meta || "Por tiempo limitado",
      dateIcon: "event",
      title: offer.title,
      subtitle: offer.activity || offer.description,
      location: offer.location || "Bilbao",
      planId: `/planes/${offer.id}`,
    })),
    ...staticOffers,
  ];

  return (
    <main className="offers-user-main">
      <h1 className="offers-user-title">Ofertas familiares cerca de ti</h1>

      <div className="offers-user-list">
        {allOffers.map((offer, i) => (
          <OfferCard
            key={offer.id}
            colorVariant={chessPattern[i % chessPattern.length]}
            badge={offer.badge}
            badgeType={offer.badgeType}
            date={offer.date}
            dateIcon={offer.dateIcon}
            title={offer.title}
            subtitle={offer.subtitle}
            location={offer.location}
            onNavigate={() => navigate(offer.planId)}
          />
        ))}
      </div>
    </main>
  );
}

export default OffersUser;
