const baseURL = "https://api.frankfurter.dev/v2"

export async function getCurrencies() {
	const response = await fetch(baseURL + "/currencies")
	if (!response.ok) {
		throw new Error("API error")
	}

	const data = await response.json()

	if (Array.isArray(data)) {
		return Object.fromEntries(data.map((currency) => [currency.iso_code, currency.name]))
	}

	return data
}

export async function getRate(fromCurrency: string, toCurrency: string) {
	const response = await fetch(baseURL + `/latest?from=${fromCurrency}&to=${toCurrency}`)
	if (!response.ok) {
		throw new Error("API error")
	}

	const data = await response.json()
	return data["rates"][toCurrency]
}

export async function getHistoricalRates(currency: string, fromDate: string, toDate: string) {
	const response = await fetch(baseURL + `/${fromDate}..${toDate}?from=${currency}`)
	if (!response.ok) {
		throw new Error("API error")
	}

	return await response.json()
}
