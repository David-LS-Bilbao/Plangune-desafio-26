import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminStore, useBusinessStore } from "../store";

function AdminDashboard() {
  const { t } = useTranslation();
  const [reviewMessage, setReviewMessage] = useState("");
  const { pendingBusinesses, approveBusiness, rejectBusiness, stats } = useAdminStore();
  const businessOffers = useBusinessStore(state => state.offers);

  const handleApprove = (id) => {
    approveBusiness(id);
    setReviewMessage(t("admin_dashboard.msg_approved"));
    setTimeout(() => setReviewMessage(""), 2000);
  };

  const handleReject = (id) => {
    if (window.confirm(t("admin_dashboard.confirm_reject"))) {
      rejectBusiness(id);
      setReviewMessage(t("admin_dashboard.msg_rejected"));
      setTimeout(() => setReviewMessage(""), 2000);
    }
  };

  return (
    <main className="admin-dashboard-main">
      <div className="admin-page-header">
        <h2 className="admin-title">{t("admin_dashboard.title")}</h2>
        <p className="admin-subtitle">{t("admin_dashboard.subtitle")}</p>
      </div>

      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="metric-icon bg-secondary-light">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div className="metric-text">
            <p className="metric-label">{t("admin_dashboard.metric_families")}</p>
            <p className="metric-number">{stats.activeFamilies}</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon bg-secondary-light">
            <span className="material-symbols-outlined">storefront</span>
          </div>
          <div className="metric-text">
            <p className="metric-label">{t("admin_dashboard.metric_businesses")}</p>
            <p className="metric-number">{stats.activeBusinesses}</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon bg-secondary-light">
            <span className="material-symbols-outlined">explore</span>
          </div>
          <div className="metric-text">
            <p className="metric-label">{t("admin_dashboard.metric_plans")}</p>
            <p className="metric-number">{businessOffers.length + 80}</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon bg-secondary-light">
            <span className="material-symbols-outlined">star_rate</span>
          </div>
          <div className="metric-text">
            <p className="metric-label">{t("admin_dashboard.metric_reviews")}</p>
            <p className="metric-number">320</p>
          </div>
        </div>
      </div>

      <div className="admin-content-grid">
        <div className="pending-column">
          <div className="section-title-row">
            <h3 className="section-title">{t("admin_dashboard.pending_title")}</h3>
          </div>

          <div className="pending-list">
            {pendingBusinesses.length === 0 ? (
              <p className="text-secondary mt-4">{t("admin_dashboard.pending_empty")}</p>
            ) : (
              pendingBusinesses.map((business) => (
                <div className="pending-card" key={business.id}>
                  <div className="pending-card-header">
                    <div className="pending-card-avatar">
                      {business.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="pending-card-body">
                      <div className="pending-meta-row">
                        <span className="badge-type">{t("admin_dashboard.badge_new_business")}</span>
                        <span className="time-ago">{business.requestDate}</span>
                      </div>
                      <h4 className="pending-title">{business.name}</h4>
                      <p className="pending-by">
                        <span className="material-symbols-outlined">mail</span>
                        {business.email}
                      </p>
                    </div>
                  </div>
                  <div className="pending-actions">
                    <button className="btn-reject" type="button" onClick={() => handleReject(business.id)}>
                      {t("admin_dashboard.btn_reject")}
                    </button>
                    <button className="btn-approve" type="button" onClick={() => handleApprove(business.id)}>
                      {t("admin_dashboard.btn_approve")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="metrics-column">
          <div className="metrics-detail-card">
            <h3 className="section-title">{t("admin_dashboard.metrics_title")}</h3>
            <div className="metrics-group">
              <h4 className="metrics-group-title">
                <span className="material-symbols-outlined">filter_alt</span>
                {t("admin_dashboard.top_filters_title")}
              </h4>
              <div className="filter-bars">
                <div className="filter-bar-row">
                  <span className="rank">#1</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: "85%" }}></div>
                    <span className="bar-label">{t("admin_dashboard.filter_changer")}<span className="bar-value">85%</span></span>
                  </div>
                </div>
                <div className="filter-bar-row">
                  <span className="rank">#2</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: "62%" }}></div>
                    <span className="bar-label">{t("admin_dashboard.filter_indoor")}<span className="bar-value">62%</span></span>
                  </div>
                </div>
                <div className="filter-bar-row">
                  <span className="rank">#3</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: "45%" }}></div>
                    <span className="bar-label">{t("admin_dashboard.filter_free")}<span className="bar-value">45%</span></span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="divider-light" />

            <div className="metrics-group">
              <h4 className="metrics-group-title">
                <span className="material-symbols-outlined">map</span>
                {t("admin_dashboard.zones_title")}
              </h4>
              <div className="zone-chips">
                <span className="zone-chip">Bilbao</span>
                <span className="zone-chip">Getxo</span>
                <span className="zone-chip">Barakaldo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {reviewMessage && <p className="status-message">{reviewMessage}</p>}
    </main>
  );
}

export default AdminDashboard;
