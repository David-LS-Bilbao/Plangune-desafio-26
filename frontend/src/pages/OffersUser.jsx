import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBusinessStore } from "../store";
import GuniFabLauncher from "../components/assistant/GuniFabLauncher";
import getPlanImage from "../utils/getPlanImage";

function OfferCard({ colorVariant, badge, badgeType, date, dateIcon, title, subtitle, location, image, onNavigate }) {
  const { t } = useTranslation();
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
            {expanded ? t("offers.read_less") : t("offers.read_more")}
          </button>
        )}
      </div>
      <button className="offer-user-card__btn" type="button">
        {t("offers.view_offer")}
      </button>
    </div>
  );
}

function OffersUser() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dynamicOffers = useBusinessStore((state) => state.offers);

  const staticOffers = [
    {
      id: "static-3",
      badge: t("offers.badge_special"),
      badgeType: "accent",
      date: t("offers.date_this_weekend"),
      dateIcon: "event",
      title: t("offers.static3_title"),
      subtitle: t("offers.static3_subtitle"),
      location: "Getxo · Costa",
      planId: "/planes/2",
    },
    {
      id: "static-1",
      badge: t("offers.badge_offer"),
      badgeType: "secondary",
      date: t("offers.static1_date"),
      dateIcon: "calendar_today",
      title: t("offers.static1_title"),
      subtitle: t("offers.static1_subtitle"),
      location: "Bilbao",
      planId: "/planes/3",
    },
    {
      id: "static-2",
      badge: t("offers.badge_workshop"),
      badgeType: "primary",
      date: t("offers.static2_date"),
      dateIcon: "event",
      title: t("offers.static2_title"),
      subtitle: t("offers.static2_subtitle"),
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
      date: offer.meta || t("offers.date_limited_time"),
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
        <h1 className="offers-user-title">{t("offers.page_title")}</h1>

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
