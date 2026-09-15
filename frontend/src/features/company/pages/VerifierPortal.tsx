import React, { useState } from 'react';

interface VerificationTask {
  id: string;
  candidateId: string;
  candidateName: string;
  documentType: string;
  documentUrl: string;
  cipcRegNumber: string;
  submittedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export const VerifierPortal: React.FC = () => {
  // Mock verification requests linked to database schema: verification_requests & documents
  const [tasks, setTasks] = useState<VerificationTask[]>([
    {
      id: 'vr-101',
      candidateId: 'cand-001',
      candidateName: 'Sipho Ndlovu',
      documentType: 'CIPC Company & Identity Audit',
      documentUrl: 'https://example.com/docs/sipho_cipc.pdf',
      cipcRegNumber: '2023/891234/07',
      submittedAt: '2026-08-24 14:30',
      status: 'PENDING',
    },
    {
      id: 'vr-102',
      candidateId: 'cand-002',
      candidateName: 'Thabo Mokoena',
      documentType: 'Qualification & Degree Certificate',
      documentUrl: 'https://example.com/docs/thabo_degree.pdf',
      cipcRegNumber: '2022/451092/07',
      submittedAt: '2026-08-25 09:15',
      status: 'PENDING',
    },
    {
      id: 'vr-103',
      candidateId: 'cand-003',
      candidateName: 'Lerato Pillay',
      documentType: 'Police Clearance Certificate',
      documentUrl: 'https://example.com/docs/lerato_pcc.pdf',
      cipcRegNumber: '2021/119842/07',
      submittedAt: '2026-08-25 11:00',
      status: 'PENDING',
    },
  ]);

  const [selectedTask, setSelectedTask] = useState<VerificationTask | null>(null);
  const [verifierNotes, setVerifierNotes] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditPassed, setAuditPassed] = useState<boolean | null>(null);

  // Simulate CIPC API Automated Check
  const handleRunCIPCCheck = () => {
    setIsAuditing(true);
    setAuditPassed(null);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditPassed(true);
    }, 1200);
  };

  // Publish decision to DB state (maps to verification_results table)
  const handlePublishResult = (decision: 'VERIFIED' | 'REJECTED') => {
    if (!selectedTask) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === selectedTask.id ? { ...t, status: decision } : t))
    );

    // Reset Modal
    setSelectedTask(null);
    setVerifierNotes('');
    setAuditPassed(null);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', color: '#0f172a' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>Verifier Audit Portal</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Review candidate background compliance, perform CIPC verification checks, and issue audit certificates.
          </p>
        </div>
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', color: '#1d4ed8', fontWeight: '700' }}>
          Role: Certified Official Verifier
        </div>
      </div>

      {/* Audit Queue List */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '800', fontSize: '14px', color: '#475569' }}>
          Pending Verification Requests ({tasks.filter((t) => t.status === 'PENDING').length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: task.status !== 'PENDING' ? '#fafafa' : '#ffffff',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{task.candidateName}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>• Ref: {task.id}</span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: '800',
                      backgroundColor:
                        task.status === 'VERIFIED'
                          ? '#ecfdf5'
                          : task.status === 'REJECTED'
                          ? '#fef2f2'
                          : '#fffbebeb',
                      color:
                        task.status === 'VERIFIED'
                          ? '#047857'
                          : task.status === 'REJECTED'
                          ? '#dc2626'
                          : '#b45309',
                    }}
                  >
                    {task.status}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                  <strong>Document:</strong> {task.documentType} | <strong>CIPC Reg:</strong> {task.cipcRegNumber}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Submitted: {task.submittedAt}
                </div>
              </div>

              <div>
                {task.status === 'PENDING' ? (
                  <button
                    onClick={() => setSelectedTask(task)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Start Audit
                  </button>
                ) : (
                  <button
                    disabled
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f1f5f9',
                      color: '#94a3b8',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '13px',
                    }}
                  >
                    Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Audit Modal */}
      {selectedTask && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Audit Candidate Record</h2>
                <p style={{ color: '#2563eb', fontWeight: '700', margin: '4px 0 0', fontSize: '14px' }}>
                  {selectedTask.candidateName} — {selectedTask.documentType}
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Document Preview & CIPC Verification */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>CIPC Registration Number:</strong> {selectedTask.cipcRegNumber}
                </div>
                <div>
                  <strong>Document Attachment:</strong>{' '}
                  <a href={selectedTask.documentUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: '700' }}>
                    View Submitted File (PDF) ↗
                  </a>
                </div>
              </div>

              {/* CIPC Automated Check Trigger */}
              <div style={{ padding: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '14px' }}>Live CIPC Registry Lookup</strong>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Query direct director & business status against government databases.</p>
                  </div>
                  <button
                    onClick={handleRunCIPCCheck}
                    disabled={isAuditing}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: isAuditing ? '#cbd5e1' : '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {isAuditing ? 'Auditing...' : 'Execute CIPC Query'}
                  </button>
                </div>

                {auditPassed !== null && (
                  <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', color: '#047857', fontSize: '12px', fontWeight: '700' }}>
                    ✓ Direct Match Confirmed: CIPC Active Status & ID Match 100% Valid.
                  </div>
                )}
              </div>

              {/* Verifier Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Official Audit Notes & Remarks
                </label>
                <textarea
                  rows={3}
                  value={verifierNotes}
                  onChange={(e) => setVerifierNotes(e.target.value)}
                  placeholder="Enter audit verification comments, license reference, or rejection reason..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => handlePublishResult('VERIFIED')}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Approve & Publish Verified Status
              </button>
              <button
                onClick={() => handlePublishResult('REJECTED')}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifierPortal;