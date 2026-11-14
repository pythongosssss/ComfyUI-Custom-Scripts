import { app } from "../../../scripts/app.js";

/**
 * Frontend 1.59 draws the setting name itself and appends whatever this
 * function returns into the value cell. A <tr> is invalid there, so move the
 * control cell into a div. Older builds, including PrimeVue settings, still
 * receive the original row.
 * @param {HTMLElement} row
 * @returns {HTMLElement}
 */
export function placeSettingRow(row) {
	if (!document.querySelector('[data-dialog-key="global-settings"]')) return row;
	const cell = row.querySelector("td:last-child") || row;
	const panel = document.createElement("div");
	panel.style.display = "flex";
	panel.style.flexDirection = "column";
	panel.style.alignItems = "flex-start";
	panel.style.gap = "4px";
	while (cell.firstChild) panel.appendChild(cell.firstChild);
	return panel;
}

/**
 * Close the settings dialog before opening a plugin window.
 * The close button is scoped to the settings dialog: a page-wide
 * ".close-button" also matches the workflow tab.
 */
export function closeGlobalSettings() {
	try {
		if (typeof app.ui.settings.element?.close === "function") {
			app.ui.settings.element.close();
		}
	} catch (error) {}

	const settingsDialog = document.querySelector('[data-dialog-key="global-settings"]');
	const closeButton = settingsDialog?.querySelector(
		'button[aria-label="Close dialog"], button[aria-label="关闭对话框"], button[data-slot="dialog-close"]'
	) || document.querySelector(".p-dialog-close-button");
	if (closeButton) {
		closeButton.click();
		return;
	}
	try {
		app.ui.settings.element.style.display = "none";
	} catch (error) {}
}
