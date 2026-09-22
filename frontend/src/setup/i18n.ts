// Thin re-export so `setup/` stays the single entry point the app wires up from,
// even though translations are static objects rather than a runtime i18n engine.
// If a second locale is ever needed, a locale switch belongs here.
export { enTranslation } from '../translations/enTranslation';
