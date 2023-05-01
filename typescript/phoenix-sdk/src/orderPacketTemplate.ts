import { SelfTradeBehavior, Side } from "./types";

/// PostOnlyOrderTemplate is a helper type for creating a post-only order, which will never be matched against existing orders.
/// The template allows you to specify the price and size in commonly understood units:
/// price is the floating point price (units of USDC per unit of SOL for the SOL/USDC market), and size is in whole base units (units of SOL for the SOL/USDC market).
/// The SDK can then convert this to a post-only order instruction, ready to be sent.
export class PostOnlyOrderTemplate {
  // The side for the order, a Side::Bid or a Side::Ask.
  side: Side;

  /// The price of the order, as the commonly understood exchange price (the number of quote units to exchange for one base unit), as a floating point number.
  priceAsFloat: number;

  /// Total number of base units to place on the book or fill at a better price.
  sizeInBaseUnits: number;

  /// Client order id used to identify the order in the response to the client.
  clientOrderId: number;

  /// Flag for whether or not to reject the order if it would immediately match or amend it to the best non-crossing price.
  /// Default value is true.
  rejectPostOnly: boolean;

  /// Flag for whether or not the order should only use funds that are already in the account.
  /// Using only deposited funds will allow the trader to pass in fewer accounts per instruction and
  /// save transaction space as well as compute.
  useOnlyDepositedFunds: boolean;

  /// If this is set, the order will be invalid after the specified slot.
  lastValidSlot?: number;

  /// If this is set, the order will be invalid after the specified unix timestamp.
  lastValidUnixTimestampInSeconds: number;
}
/// LimitOrderTemplate is a helper type for creating a limit order.
/// The template allows you to specify the price and size in commonly understood units:
/// price is the floating point price (units of USDC per unit of SOL for the SOL/USDC market), and size is in whole base units (units of SOL for the SOL/USDC market).
/// The SDK can then convert this to a limit order instruction, ready to be sent.
export class LimitOrderTemplate {
  // The side for the order, a Side::Bid or a Side::Ask.
  side: Side;

  /// The price of the order, as the commonly understood exchange price (the number of quote units to exchange for one base unit), as a floating point number.
  priceAsFloat: number;

  /// Total number of base units to place on the book or fill at a better price.
  sizeInBaseUnits: number;

  /// How the matching engine should handle a self trade.
  selfTradeBehavior: SelfTradeBehavior;

  /// Number of orders to match against. If this is `None` there is no limit.
  matchLimit?: number;

  /// Client order id used to identify the order in the response to the client.
  clientOrderId: number;

  // Flag for whether or not the order should only use funds that are already in the account.
  /// Using only deposited funds will allow the trader to pass in fewer accounts per instruction and
  /// save transaction space as well as compute.
  useOnlyDepositedFunds: boolean;

  /// If this is set, the order will be invalid after the specified slot.
  lastValidSlot?: number;

  /// If this is set, the order will be invalid after the specified unix timestamp.
  lastValidUnixTimestampInSeconds?: number;
}

/// ImmediateOrCancelOrderTemplate is a helper type for creating an immediate or cancel order.
/// The template allows you to specify the price and size in commonly understood units:
/// price is the floating point price (units of USDC per unit of SOL for the SOL/USDC market), and size is in whole base units (units of SOL for the SOL/USDC market).
/// The SDK can then convert this to a limit order instruction, ready to be sent.
///
/// Immediate-or-cancel orders will be matched against existing resting orders.
/// If the order matches fewer than `minUnits`, it will be cancelled.
///
/// Fill or Kill (FOK) orders are a subset of Immediate or Cancel (IOC) orders where either
/// the `sizeInBaseUnits` is equal to the `minBaseUnitsToFill` of the order, or the `sizeInQuoteUnits` is
/// equal to the `minQuoteUnitsToFill` of the order.
export class ImmediateOrCancelOrderTemplate {
  // The side for the order, a Side::Bid or a Side::Ask.
  side: Side;

  /// The most aggressive price an order can be matched at. If this value is None, then the order
  /// is treated as a market order.
  priceAsFloat: number;

  /// The number of base units to fill against the order book. Either this parameter or the `sizeInQuoteUnits`
  /// parameter must be set to a nonzero value.
  sizeInBaseUnits: number;

  /// The number of quote units to fill against the order book. Either this parameter or the `sizeInBaseUnits`
  /// parameter must be set to a nonzero value.
  sizeInQuoteUnits: number;

  /// The minimum number of base units to fill against the order book. If the order does not fill
  /// this many base lots, it will be voided.
  minBaseUnitsToFill: number;

  /// The minimum number of quote units to fill against the order book. If the order does not fill
  /// this many quote lots, it will be voided.
  minQuoteUnitsToFill: number;

  /// How the matching engine should handle a self trade.
  selfTradeBehavior: SelfTradeBehavior;

  /// Number of orders to match against. If set to `None`, there is no limit.
  matchLimit?: number;

  /// Client order id used to identify the order in the response to the client.
  clientOrderId: number;

  /// Flag for whether or not the order should only use funds that are already in the account.
  /// Using only deposited funds will allow the trader to pass in less accounts per instruction and
  /// save transaction space as well as compute. This is only for traders who have a seat.
  useOnlyDepositedFunds: boolean;

  /// If this is set, the order will be invalid after the specified slot.
  lastValidSlot?: number;

  /// If this is set, the order will be invalid after the specified unix timestamp.
  lastValidUnixTimestampInSeconds?: number;
}