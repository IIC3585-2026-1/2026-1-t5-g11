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
	// TODO check correct order of currency parameters
	const response = await fetch(baseURL + `/rate/${fromCurrency}/${toCurrency}`)
	if (!response.ok) {
		throw new Error("API error")
	}

	return (await response.json())["rate"]
}
