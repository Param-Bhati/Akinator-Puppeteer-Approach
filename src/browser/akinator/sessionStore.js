// src/browser/akinator/sessionStore.js

const sessions = new Map(); // userId -> { page, lastActivity, state }

function createSession(userId, data) {
  sessions.set(userId, {
    ...data,
    lastActivity: Date.now()
  });
}

function getSession(userId) {
  return sessions.get(userId) || null;
}

function updateSession(userId, partial) {
  const existing = sessions.get(userId);
  if (!existing) return;
  sessions.set(userId, {
    ...existing,
    ...partial,
    lastActivity: Date.now()
  });
}

function deleteSession(userId) {
  sessions.delete(userId);
}

function cleanupInactive(maxAgeMs = 5 * 60 * 1000) {
  const now = Date.now();
  for (const [userId, session] of sessions.entries()) {
    if (now - session.lastActivity > maxAgeMs) {
      // caller is responsible for closing page
      sessions.delete(userId);
    }
  }
}

module.exports = {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  cleanupInactive
};
