import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessStore } from "../store";
import GuniFabLauncher from "../components/assistant/GuniFabLauncher";
import getPlanImage from "../utils/getPlanImage";

function OfferCard({ colorVariant, badge, badgeType, date, dateIcon, title, subtitle, location, image, onNavigate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`offer-user-card offer-user-card--${colorVariant}`}
      onClick={onNavigate}
    >
      <div className="offer-user-card__image">
        <img src={image} alt={`Imagen de ${title || "oferta familiar"}`} loading="lazy" />
      </div>
      <span className={`offer-user-badge offer-user-badge--${badgeType}`}>{badge}</span>
      <h3 className="offer-user-card__title">{title}</h3>
      <span className="offer-user-date">
        <span className="material-symbols-outlined">{dateIcon}</span>
        {date}
      </span>
      <div className="offer-user-card__location">
        <span className="material-symbols-outlined">location_on</span>
        {location}
      </div>
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
      id: "static-3",
      badge: "ESPECIAL",
      badgeType: "accent",
      date: "Este fin de semana",
      dateIcon: "event",
      title: "Juegos en la playa de Ereaga",
      subtitle: "Descubre los mejores miradores y playas accesibles con carrito de la costa vasca.",
      location: "Getxo · Costa",
      planId: "/planes/2",
    },
    {
      id: "static-1",
      badge: "OFERTA",
      badgeType: "secondary",
      date: "Hasta 31 Oct",
      dateIcon: "calendar_today",
      title: "2x1 en menú infantil",
      subtitle: "Comida Familiar de Domingo",
      location: "Bilbao",
      planId: "/planes/3",
    },
    {
      id: "static-2",
      badge: "TALLER",
      badgeType: "primary",
      date: "Solo miércoles",
      dateIcon: "event",
      title: "Taller gratuito",
      subtitle: "Taller de Otoño Creativo",
      location: "Bilbao",
      planId: "/planes/10",
    },
  ];

  const chessPattern = ["tertiary", "primary", "accent"];

  const dynamicOfferCards = dynamicOffers
    .filter((o) => o.status === "active")
    .map((offer) => ({
      id: offer.id,
      badge: "OFERTA",
      badgeType: "primary",
      date: offer.meta || "Por tiempo limitado",
      dateIcon: "event",
      title: offer.title,
      subtitle: offer.activity || offer.description,
      location: offer.location || "Bilbao",
      planId: `/planes/${offer.id}`,
    }));

  const guggenheimOffer = dynamicOfferCards.find((o) => o.title === "Guggenheim Txiki");
  const otherDynamicOffers = dynamicOfferCards.filter((o) => o !== guggenheimOffer);

  const allOffers = [
    staticOffers[0],
    ...(guggenheimOffer ? [guggenheimOffer] : []),
    ...staticOffers.slice(1),
    ...otherDynamicOffers,
  ];

  return (
    <>
      <main className="offers-user-main">
        <h1 className="offers-user-title">Ofertas para tu familia</h1>

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
              image={getPlanImage(offer)}
              onNavigate={() => navigate(offer.planId)}
            />
          ))}
        </div>
      </main>

      <GuniFabLauncher />
    </>
  );
}

export default OffersUser;
