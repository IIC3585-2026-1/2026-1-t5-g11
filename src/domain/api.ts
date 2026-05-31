const baseURL = "https://api.frankfurter.dev/v2"

export async function getCurrencies() {
	const response = await fetch(baseURL + "/currency")
	if (!response.ok) {
		throw new Error("API error")
	}

	return await response.json()
}

export async function getRate(fromCurrency: string, toCurrency: string) {
	// TODO check correct order of currency parameters
	const response = await fetch(baseURL + `/rate/${fromCurrency}/${toCurrency}`)
	if (!response.ok) {
		throw new Error("API error")
	}

	return (await response.json())["rate"]
}
