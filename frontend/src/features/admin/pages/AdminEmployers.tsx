import { useEffect, useMemo, useState } from "react";

import AdminPageHeader from "../components/AdminPageHeader";
import AdminSearch from "../components/AdminSearch";
import AdminTable from "../components/AdminTable";
import AdminStatusBadge from "../components/AdminStatusBadge";

import { getAdminEmployers } from "../admin.service";
import type { AdminEmployer } from "../admin.types";


export default function AdminEmployers() {

  const [employers, setEmployers] =
    useState<AdminEmployer[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
   * =====================================================
   * LOAD EMPLOYERS
   * =====================================================
   */

  useEffect(() => {

    async function loadEmployers() {

      try {

        setLoading(true);
        setError("");

        const data =
          await getAdminEmployers();

        setEmployers(data);

      } catch (err) {

        console.error(
          "Failed to load employers:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load employers."
        );

      } finally {

        setLoading(false);

      }
    }

    loadEmployers();

  }, []);


  /*
   * =====================================================
   * SEARCH
   * =====================================================
   */

  const filteredEmployers =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return employers;
      }

      return employers.filter(
        (employer) =>
          [
            employer.company,
            employer.email,
            employer.industry,
            employer.verified ? "Verified" : "Pending",
            employer.status,
          ]
            .join(" ")
            .toLowerCase()
            .includes(value)
      );

    }, [search, employers]);


  /*
   * =====================================================
   * SUMMARY
   * =====================================================
   */

  const totalEmployers =
  employers.length;

const verifiedEmployers =
  employers.filter(
    (employer) => employer.verified
  ).length;

const activeEmployers =
  employers.filter(
    (employer) =>
      employer.status.toLowerCase() === "active"
  ).length;

const pendingEmployers =
  employers.filter(
    (employer) => !employer.verified
  ).length;


  /*
   * =====================================================
   * TABLE COLUMNS
   * =====================================================
   */

  const columns = [

    {
      key: "company",
      label: "Company",

      render: (employer: AdminEmployer) => (

        <div className="admin-person">

          <div className="admin-person-avatar">

            {employer.company
              .charAt(0)
              .toUpperCase()}

          </div>

          <div>

            <strong>
              {employer.company}
            </strong>

            <span>
              Employer
            </span>

          </div>

        </div>

      ),
    },


    {
      key: "email",
      label: "Email",
    },


    {
      key: "industry",
      label: "Industry",
    },


    {
      key: "verification",
      label: "Verification",

      render: (employer: AdminEmployer) => (

        <AdminStatusBadge
          status={employer.verified ? "Verified" : "Pending"}
        />

      ),
    },


    {
      key: "status",
      label: "Status",

      render: (employer: AdminEmployer) => (

        <AdminStatusBadge
          status={employer.status}
        />

      ),
    },


    {
      key: "actions",
      label: "",

      render: () => (

        <button
          type="button"
          className="admin-row-action"
        >
          View
        </button>

      ),
    },

  ];


  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (

    <div className="admin-page">

      <AdminPageHeader
        eyebrow="PEOPLE"
        title="Employers"
        description="Manage companies registered on the TruCity platform."
      />


      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <section className="admin-list-summary">

        <div>

          <strong>
            {loading
              ? "—"
              : totalEmployers}
          </strong>

          <span>
            Total employers
          </span>

        </div>


        <div>

          <strong>
            {loading
              ? "—"
              : verifiedEmployers}
          </strong>

          <span>
            Verified employers
          </span>

        </div>


        <div>

          <strong>
            {loading
              ? "—"
              : activeEmployers}
          </strong>

          <span>
            Active employers
          </span>

        </div>


        <div>

          <strong>
            {loading
              ? "—"
              : pendingEmployers}
          </strong>

          <span>
            Pending verification
          </span>

        </div>

      </section>


      {/* =====================================================
          TOOLBAR
          ===================================================== */}

      <section className="admin-list-toolbar">

        <AdminSearch
          value={search}
          onChange={setSearch}
          placeholder="Search employers..."
        />

        <button
          type="button"
          className="admin-filter-button"
        >
          Filter
        </button>

      </section>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (

        <div className="admin-error">
          {error}
        </div>

      )}


      {/* =====================================================
          TABLE
          ===================================================== */}

      <section className="admin-table-card">

        <div className="admin-table-header">

          <div>

            <h2>
              Employer Directory
            </h2>

            <p>
              Review companies and their platform status.
            </p>

          </div>


          <span className="admin-table-count">

            {loading
              ? "Loading..."
              : `${filteredEmployers.length} results`}

          </span>

        </div>


        <AdminTable
          columns={columns}
          data={filteredEmployers}
          emptyMessage={
            loading
              ? "Loading employers..."
              : "No employers found."
          }
        />

      </section>

    </div>

  );
}
