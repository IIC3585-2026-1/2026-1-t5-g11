<script lang="ts">
	import { onMount } from 'svelte';
	import { getCurrencies, getRate } from '../domain/api';

	type CurrencyMap = Record<string, string>;
	type CurrencyOption = {
		code: string;
		name: string;
		symbol: string;
	};

	const currencySymbols: Record<string, string> = {
		ARS: '$',
		AUD: 'A$',
		BRL: 'R$',
		CAD: 'C$',
		CHF: 'CHF',
		CLP: '$',
		CNY: '¥',
		COP: '$',
		CZK: 'Kč',
		DKK: 'kr',
		EUR: '€',
		GBP: '£',
		HKD: 'HK$',
		HUF: 'Ft',
		IDR: 'Rp',
		ILS: '₪',
		INR: '₹',
		ISK: 'kr',
		JPY: '¥',
		KRW: '₩',
		MXN: 'MX$',
		MYR: 'RM',
		NOK: 'kr',
		NZD: 'NZ$',
		PHP: '₱',
		PLN: 'zł',
		RON: 'lei',
		RUB: '₽',
		SEK: 'kr',
		SGD: 'S$',
		THB: '฿',
		TRY: '₺',
		UAH: '₴',
		USD: '$',
		ZAR: 'R'
	};

	let currencies = $state<CurrencyOption[]>([]);
	let amount = $state(1);
	let amountInput = $state('');
	let fromCurrency = $state('USD');
	let toCurrency = $state('EUR');
	let rate = $state(1);
	let loadingCurrencies = $state(true);
	let loadingRate = $state(false);
	let error = $state('');
	let status = $state('Loading available currencies...');
	let requestId = $state(0);

	function formatInputAmount(value: number) {
		return new Intl.NumberFormat('en-US', {
			maximumFractionDigits: 0
		}).format(value);
	}

	function formatDisplayAmount(value: number) {
		return new Intl.NumberFormat('en-US', {
			maximumFractionDigits: 2
		}).format(value);
	}

	function getCurrencySymbol(code: string) {
		return currencySymbols[code] ?? code;
	}

	function formatCurrencyAmount(value: number, code: string) {
		return `${getCurrencySymbol(code)} ${formatDisplayAmount(value)}`;
	}

	function formatCurrencyInput(value: number, code: string) {
		return `${getCurrencySymbol(code)} ${formatInputAmount(value)}`;
	}

	function parseCurrencyAmount(rawValue: string) {
		const cleanedValue = rawValue.replace(/\D/g, '');
		const parsedValue = Number(cleanedValue);

		return Number.isFinite(parsedValue) ? parsedValue : 0;
	}

	function syncAmountInput() {
		amountInput = formatCurrencyInput(amount, fromCurrency);
	}

	function handleAmountInput(event: Event) {
		const inputElement = event.currentTarget as HTMLInputElement;
		amount = parseCurrencyAmount(inputElement.value);
		syncAmountInput();
		void refreshRate();
	}

	function handleAmountKeydown(event: KeyboardEvent) {
		const allowedKeys = new Set([
			'Backspace',
			'Delete',
			'Tab',
			'ArrowLeft',
			'ArrowRight',
			'ArrowUp',
			'ArrowDown',
			'Home',
			'End',
			'Enter',
			'Escape'
		]);

		if (amount === 0 && (event.key === 'Backspace' || event.key === 'Delete')) {
			event.preventDefault();
			return;
		}

		if (allowedKeys.has(event.key) || event.ctrlKey || event.metaKey || event.altKey) {
			return;
		}

		if (!/^[0-9]$/.test(event.key)) {
			event.preventDefault();
		}
	}

	function handleFromCurrencyChange() {
		syncAmountInput();
		void refreshRate();
	}

	function pickDefaultCurrencies(options: CurrencyOption[]) {
		const codes = options.map((option) => option.code);
		fromCurrency = codes.includes('USD') ? 'USD' : codes[0] ?? 'USD';
		toCurrency = codes.includes('EUR') ? 'EUR' : codes.find((code) => code !== fromCurrency) ?? fromCurrency;

		if (fromCurrency === toCurrency && codes.length > 1) {
			toCurrency = codes.find((code) => code !== fromCurrency) ?? toCurrency;
		}

		syncAmountInput();
	}

	async function refreshRate() {
		if (!fromCurrency || !toCurrency) {
			return;
		}

		const currentRequest = ++requestId;
		loadingRate = true;
		error = '';

		try {
			const nextRate = await getRate(fromCurrency, toCurrency);

			if (currentRequest !== requestId) {
				return;
			}

			rate = nextRate;
			status = `${formatCurrencyAmount(1, fromCurrency)} = ${formatCurrencyAmount(nextRate, toCurrency)}`;
		} catch (thrownError) {
			if (currentRequest !== requestId) {
				return;
			}

			error = thrownError instanceof Error ? thrownError.message : 'Unable to load the exchange rate.';
			status = 'Could not load the current exchange rate.';
		} finally {
			if (currentRequest === requestId) {
				loadingRate = false;
			}
		}
	}

	async function loadCurrencies() {
		loadingCurrencies = true;
		error = '';

		try {
			const data = (await getCurrencies()) as CurrencyMap;
			currencies = Object.entries(data)
				.map(([code, name]) => ({ code, name, symbol: getCurrencySymbol(code) }))
				.sort((left, right) => left.code.localeCompare(right.code));
			pickDefaultCurrencies(currencies);
			await refreshRate();
		} catch (thrownError) {
			error = thrownError instanceof Error ? thrownError.message : 'Unable to load currencies.';
			status = 'Unable to load currencies right now.';
		} finally {
			loadingCurrencies = false;
		}
	}

	function swapCurrencies() {
		[fromCurrency, toCurrency] = [toCurrency, fromCurrency];
		syncAmountInput();
		void refreshRate();
	}

	onMount(() => {
		syncAmountInput();
		void loadCurrencies();
	});
</script>

<svelte:head>
	<title>MoneyExchange</title>
	<meta
		name="description"
		content="Convert between currencies with live exchange rates from the Frankfurter API."
	/>
</svelte:head>

<div class="page">
	<section class="hero">
		<p class="eyebrow">Frankfurter API</p>
		<h1>MoneyExchange</h1>
		<p class="intro">
			Elige dos monedas, ingresa un monto y obtén una conversión en vivo sin salir de la página.
		</p>
	</section>

	<section class="converter-card" aria-busy={loadingCurrencies || loadingRate}>
		<div class="controls">
			<div class="amount-grid">
				<label>
					<span>Amount</span>
					<input
						value={amountInput}
						oninput={handleAmountInput}
						onkeydown={handleAmountKeydown}
						type="text"
						inputmode="numeric"
						pattern="[0-9]*"
					/>
				</label>

				<label>
					<span>Converted</span>
					<input value={formatCurrencyAmount(amount * rate, toCurrency)} type="text" readonly />
				</label>
			</div>

			<div class="currency-grid">
				<label>
					<span>From</span>
					<select bind:value={fromCurrency} onchange={handleFromCurrencyChange} disabled={loadingCurrencies}>
						{#each currencies as currency (currency.code)}
							<option value={currency.code}>{currency.code} - {currency.name}</option>
						{/each}
					</select>
				</label>

				<button class="swap" type="button" onclick={swapCurrencies} aria-label="Swap currencies">
					⇄
				</button>

				<label>
					<span>To</span>
					<select bind:value={toCurrency} onchange={() => void refreshRate()} disabled={loadingCurrencies}>
						{#each currencies as currency (currency.code)}
							<option value={currency.code}>{currency.code} - {currency.name}</option>
						{/each}
					</select>
				</label>
			</div>

			<div class="status-row">
				<p>{loadingCurrencies ? 'Loading currencies...' : loadingRate ? 'Updating rate...' : status}</p>
				<button type="button" class="refresh" onclick={() => void refreshRate()} disabled={loadingCurrencies || loadingRate}>
					Refresh rate
				</button>
			</div>

			{#if error}
				<p class="error">{error}</p>
			{/if}
		</div>
	</section>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
		background:
			radial-gradient(circle at top left, rgba(255, 196, 96, 0.28), transparent 30%),
			radial-gradient(circle at top right, rgba(74, 128, 255, 0.24), transparent 34%),
			linear-gradient(180deg, #f6f2ea 0%, #eef2f9 100%);
		color: #132238;
	}

	.page {
		padding: 4rem 1.25rem;
		display: flex;
        flex-direction: column;
		gap: 1.75rem;
		place-items: center;
	}

	.hero,
	.converter-card {
		width: min(100%, 920px);
	}

	.hero {
		display: grid;
		gap: 0.5rem;
	}

	.eyebrow {
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.24em;
		font-size: 0.78rem;
		color: #6d5b34;
	}

	h1 {
		margin: 0;
		font-size: clamp(2.4rem, 6vw, 4.8rem);
		line-height: 0.95;
		font-family: Georgia, 'Times New Roman', serif;
	}

	.intro {
		margin: 0;
		max-width: 60ch;
		font-size: 1.05rem;
		line-height: 1.6;
		color: #40536d;
	}

	.converter-card {
		display: flex;
		gap: 1.5rem;
		padding: 1.5rem;
		border: 1px solid rgba(19, 34, 56, 0.12);
		border-radius: 28px;
		background: rgba(255, 255, 255, 0.82);
		backdrop-filter: blur(14px);
		box-shadow: 0 20px 60px rgba(19, 34, 56, 0.12);
	}

	.controls,
	.amount-grid {
		display: grid;
		gap: 1rem;
	}

	.controls {
		align-content: start;
	}

	label {
		display: grid;
		gap: 0.55rem;
		font-size: 0.95rem;
		font-weight: 700;
		color: #22334b;
		min-width: 0;
	}

	input,
	select,
	button {
		font: inherit;
	}

	input,
	select {
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
		padding: 0.95rem 1rem;
		border: 1px solid rgba(19, 34, 56, 0.16);
		border-radius: 16px;
		background: #fff;
		color: #132238;
	}

	.currency-grid {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 0.8rem;
		align-items: end;
	}

	.amount-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.swap,
	.refresh {
		border: 0;
		border-radius: 999px;
		cursor: pointer;
	}

	.swap {
		align-self: center;
		justify-self: center;
		width: 3rem;
		height: 3rem;
		background: #132238;
		color: #fff;
		font-size: 1.2rem;
		box-shadow: 0 10px 20px rgba(19, 34, 56, 0.2);
	}

	.status-row p,
	.error {
		margin: 0;
		line-height: 1.5;
	}

	.status-row {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		justify-content: space-between;
		padding-top: 0.4rem;
		color: #40536d;
	}

	.refresh {
		padding: 0.8rem 1rem;
		background: #132238;
		color: #fff;
	}

	.error {
		padding: 0.85rem 1rem;
		border-radius: 14px;
		background: rgba(255, 110, 110, 0.16);
		color: #c53030;
	}

	input:disabled,
	select:disabled,
	button:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}

	@media (max-width: 760px) {
		.page {
			padding: 1.25rem;
		}

		.converter-card {
			grid-template-columns: 1fr;
		}

		.amount-grid,
		.currency-grid {
			grid-template-columns: 1fr;
		}

		.swap {
			justify-self: start;
		}

		.status-row {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
