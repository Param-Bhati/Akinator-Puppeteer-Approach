// src/akinator/sessions.js

const sessions = new Map(); // key: userId, value: session object

function createSession(userId, data) {
  sessions.set(userId, {
    ...data,
    lastActivity: Date.now()
  });
}

function getSession(userId) {
  const session = sessions.get(userId);
  if (!session) return null;
  return session;
}

function updateSession(userId, partial) {
  const session = sessions.get(userId);
  if (!session) return;
  sessions.set(userId, {
    ...session,
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
