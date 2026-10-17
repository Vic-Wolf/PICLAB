/* Compatibility barrel. PICLAB workspaces are now implemented in dedicated modules. */
export { renderLearnView, bindLearnEvents as bindHelpEvents } from './learningView.js';
export { renderPinoutView, bindPinoutEvents } from './pinoutView.js';
export { renderRegistersView, bindRegisterEvents } from './registerView.js';
export { renderLabsView, bindLabsEvents } from './labsView.js';
export { renderChallengesView, bindChallengesEvents } from './challengesView.js';
export { renderQuizView, bindQuizEvents } from './quizView.js';
export { renderProgressView } from './progressView.js';
export { renderHelpView } from './helpView.js';
