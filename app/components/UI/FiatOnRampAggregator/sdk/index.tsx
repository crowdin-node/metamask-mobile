import React, { useState, useCallback, useEffect, createContext, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IOnRampSdk, Environment, Context } from '@chingiz-mardanov/on-ramp-sdk';
import SDK from './SDK';
import {
	fiatOrdersCountrySelectorAgg,
	setFiatOrdersCountryAGG,
	selectedAddressSelector,
	chainIdSelector,
} from '../../../../reducers/fiatOrders';
export interface IFiatOnRampSDK {
	sdk: IOnRampSdk | undefined;
	selectedCountry: any;
	setSelectedCountry: (country: any) => void;

	selectedRegion: any;
	setSelectedRegion: (region: any) => void;

	selectedPaymentMethod: string;
	setSelectedPaymentMethod: (paymentMethod: string) => void;

	selectedAsset: string;
	setSelectedAsset: (asset: string) => void;

	selectedFiatCurrencyId: string;
	setSelectedFiatCurrencyId: (asset: string) => void;

	selectedAddress: string;
	selectedChainId: string;
}

interface IProviderProps<T> {
	value?: T;
	children?: React.ReactNode | undefined;
}

const isDevelopment = process.env.NODE_ENV !== 'production';
const VERBOSE_SDK = isDevelopment;

const SDKContext = createContext<IFiatOnRampSDK | undefined>(undefined);

export const FiatOnRampSDKProvider = ({ value, ...props }: IProviderProps<IFiatOnRampSDK>) => {
	const [sdkModule, setSdkModule] = useState<IOnRampSdk | undefined>(undefined);
	useEffect(() => {
		(async () => {
			setSdkModule(
				await SDK.getSDK(Environment.Staging, Context.Mobile, {
					verbose: VERBOSE_SDK,
				})
			);
		})();
	}, []);

	const sdk: IOnRampSdk | undefined = useMemo(() => sdkModule, [sdkModule]);

	const dispatch = useDispatch();

	const INITIAL_SELECTED_COUNTRY: string = useSelector(fiatOrdersCountrySelectorAgg);
	const selectedAddress: string = useSelector(selectedAddressSelector);
	const selectedChainId: string = useSelector(chainIdSelector);

	const INITIAL_SELECTED_REGION = INITIAL_SELECTED_COUNTRY;
	const INITIAL_PAYMENT_METHOD = '/payments/debit-credit-card';
	const INITIAL_SELECTED_ASSET = 'ETH';

	const [selectedCountry, setSelectedCountry] = useState(INITIAL_SELECTED_COUNTRY);
	const [selectedRegion, setSelectedRegion] = useState(INITIAL_SELECTED_REGION);
	const [selectedAsset, setSelectedAsset] = useState(INITIAL_SELECTED_ASSET);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(INITIAL_PAYMENT_METHOD);
	const [selectedFiatCurrencyId, setSelectedFiatCurrencyId] = useState('');

	const setSelectedCountryCallback = useCallback(
		(country) => {
			setSelectedCountry(country);
			dispatch(setFiatOrdersCountryAGG(country.id));
		},
		[dispatch]
	);

	const setSelectedRegionCallback = useCallback((region) => {
		setSelectedRegion(region);
	}, []);

	const setSelectedPaymentMethodCallback = useCallback((paymentMethod) => {
		setSelectedPaymentMethod(paymentMethod);
	}, []);

	const setSelectedAssetCallback = useCallback((asset) => {
		setSelectedAsset(asset);
	}, []);

	const setSelectedFiatCurrencyCallback = useCallback((currency) => {
		setSelectedFiatCurrencyId(currency);
	}, []);

	const contextValue: IFiatOnRampSDK = {
		sdk,
		selectedCountry,
		setSelectedCountry: setSelectedCountryCallback,

		selectedRegion,
		setSelectedRegion: setSelectedRegionCallback,

		selectedPaymentMethod,
		setSelectedPaymentMethod: setSelectedPaymentMethodCallback,

		selectedAsset,
		setSelectedAsset: setSelectedAssetCallback,

		selectedFiatCurrencyId,
		setSelectedFiatCurrencyId: setSelectedFiatCurrencyCallback,

		selectedAddress,
		selectedChainId,
	};

	return <SDKContext.Provider value={value || contextValue} {...props} />;
};

export const useFiatOnRampSDK = () => {
	const contextValue = useContext(SDKContext);
	return contextValue as IFiatOnRampSDK;
};

interface config<T> {
	method: T;
	onMount?: boolean;
}

export function useSDKMethod<T extends keyof IOnRampSdk>(
	config: T | config<T>,
	...params: Parameters<IOnRampSdk[T]>
): [{ data: any; error: string | null; isFetching: boolean }, () => Promise<void>] {
	const { sdk }: { sdk: IOnRampSdk } = useFiatOnRampSDK() as any;
	const [data, setData] = useState<any | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isFetching, setIsFetching] = useState<boolean>(true);
	const stringifiedParams = useMemo(() => JSON.stringify(params), [params]);
	const method = typeof config === 'string' ? config : config.method;
	const onMount = typeof config === 'string' ? true : config.onMount ?? true;

	const query = useCallback(async () => {
		try {
			setIsFetching(true);
			if (sdk) {
				// @ts-expect-error spreading params error
				const sdkMethod = (...a) => sdk[method](...a);
				const response = await sdkMethod(...params);
				setData(response);
			}
		} catch (responseError) {
			// logging maybe
			setError((responseError as Error).message);
		} finally {
			setIsFetching(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [method, stringifiedParams, sdk]);

	useEffect(() => {
		if (onMount) {
			query();
		} else {
			setIsFetching(false);
		}
	}, [query, onMount]);

	return [{ data, error, isFetching }, query];
}

export const withFiatOnRampSDK = (Component: React.FC) => (props: any) =>
	(
		<FiatOnRampSDKProvider>
			<Component {...props} />
		</FiatOnRampSDKProvider>
	);

export default SDKContext;