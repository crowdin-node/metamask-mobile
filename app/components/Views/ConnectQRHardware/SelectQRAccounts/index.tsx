import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CheckBox from '@react-native-community/checkbox';
import { useSelector } from 'react-redux';
import { fontStyles } from '../../../../styles/common';
import { strings } from '../../../../../locales/i18n';
import { IAccount } from '../types';
import Device from '../../../../util/device';
import { mockTheme, useAppThemeFromContext } from '../../../../util/theme';
import AccountDetails from '../AccountDetails';
import StyledButton from '../../../UI/StyledButton';

interface ISelectQRAccountsProps {
	canUnlock: boolean;
	accounts: IAccount[];
	nextPage: () => void;
	prevPage: () => void;
	toggleAccount: (index: number) => void;
	onUnlock: () => void;
	onForget: () => void;
}

const createStyle = (colors: any) =>
	StyleSheet.create({
		container: {
			flex: 1,
			width: '100%',
			paddingHorizontal: 32,
		},
		title: {
			marginTop: 40,
			fontSize: 24,
			marginBottom: 24,
			...fontStyles.normal,
			color: colors.text.default,
		},
		account: {
			flexDirection: 'row',
			paddingHorizontal: 12,
			paddingVertical: 5,
		},
		checkBox: {
			backgroundColor: colors.background.default,
		},
		number: {
			...fontStyles.normal,
			color: colors.text.default,
		},
		address: {
			marginLeft: 8,
			fontSize: 15,
			flexGrow: 1,
			...fontStyles.normal,
			color: colors.text.default,
		},
		pagination: {
			alignSelf: 'flex-end',
			flexDirection: 'row',
			alignItems: 'center',
		},
		paginationText: {
			...fontStyles.normal,
			fontSize: 18,
			color: colors.primary.default,
		},
		paginationItem: {
			flexDirection: 'row',
			alignItems: 'center',
			marginRight: 8,
		},
		bottom: {
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingTop: 75,
			paddingBottom: Device.isIphoneX() ? 20 : 10,
		},
		button: {
			width: '100%',
			justifyContent: 'flex-end',
		},
	});

const SelectQRAccounts = (props: ISelectQRAccountsProps) => {
	const { accounts, prevPage, nextPage, toggleAccount, onForget, onUnlock, canUnlock } = props;
	const { colors } = useAppThemeFromContext() || mockTheme;
	const styles = createStyle(colors);
	const provider = useSelector((state: any) => state.engine.backgroundState.NetworkController.provider);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{strings('connect_qr_hardware.select_accounts')}</Text>
			<FlatList
				data={accounts}
				keyExtractor={(item) => `address-${item.index}`}
				renderItem={({ item }) => (
					<View style={[styles.account]}>
						<CheckBox
							style={[styles.checkBox]}
							disabled={item.exist}
							value={item.checked}
							onValueChange={() => toggleAccount(item.index)}
							boxType={'square'}
							tintColors={{ true: colors.primary.default, false: colors.border.default }}
							onCheckColor={colors.background.default}
							onFillColor={colors.primary.default}
							onTintColor={colors.primary.default}
							testID={'skip-backup-check'}
						/>
						<AccountDetails item={item} provider={provider} />
					</View>
				)}
			/>
			<View style={styles.pagination}>
				<TouchableOpacity style={styles.paginationItem} onPress={prevPage}>
					<Icon name={'chevron-left'} color={colors.primary.default} />
					<Text style={styles.paginationText}>{strings('connect_qr_hardware.prev')}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.paginationItem} onPress={nextPage}>
					<Text style={styles.paginationText}>{strings('connect_qr_hardware.next')}</Text>
					<Icon name={'chevron-right'} color={colors.primary.default} />
				</TouchableOpacity>
			</View>
			<View style={styles.bottom}>
				<StyledButton
					type={'confirm'}
					onPress={onUnlock}
					containerStyle={[styles.button]}
					disabled={!canUnlock}
				>
					{strings('connect_qr_hardware.unlock')}
				</StyledButton>
				<StyledButton type={'transparent-blue'} onPress={onForget} containerStyle={[styles.button]}>
					{strings('connect_qr_hardware.forget')}
				</StyledButton>
			</View>
		</View>
	);
};

export default SelectQRAccounts;
