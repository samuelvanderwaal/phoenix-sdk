use crate::{market_event_handler::SDKMarketEvent, sdk_client::SDKClient};
use solana_client::rpc_client::{GetConfirmedSignaturesForAddress2Config, RpcClient};
use solana_sdk::{commitment_config::CommitmentConfig, signature::Signature};
use std::{
    str::FromStr,
    sync::{mpsc::Sender, Arc},
    thread::{Builder, JoinHandle},
    time::Duration,
};

pub struct EventPoller {
    pub worker: JoinHandle<Option<()>>,
}

impl EventPoller {
    pub fn new(
        sdk: Arc<SDKClient>,
        rpc_client: RpcClient,
        event_sender: Sender<Vec<SDKMarketEvent>>,
        timeout_ms: u64,
    ) -> Self {
        let worker = Builder::new()
            .name("event-poller".to_string())
            .spawn(move || Self::run(event_sender, sdk.clone(), rpc_client, timeout_ms))
            .unwrap();

        Self { worker }
    }

    pub fn new_with_default_timeout(
        sdk: Arc<SDKClient>,
        rpc_client: RpcClient,
        event_sender: Sender<Vec<SDKMarketEvent>>,
    ) -> Self {
        Self::new(sdk, rpc_client, event_sender, 1000)
    }

    pub fn join(self) -> Option<()> {
        self.worker.join().unwrap()
    }

    pub fn run(
        event_sender: Sender<Vec<SDKMarketEvent>>,
        sdk: Arc<SDKClient>,
        rpc_client: RpcClient,
        timeout_ms: u64,
    ) -> Option<()> {
        let mut until = None;
        let rt = tokio::runtime::Runtime::new().unwrap();
        // TODO: keep some state of signatures that have already been processed
        // TODO: make sure events are processed in order
        loop {
            let config = match until {
                None => GetConfirmedSignaturesForAddress2Config {
                    before: None,
                    until: None,
                    limit: Some(1),
                    commitment: Some(CommitmentConfig::confirmed()),
                },
                Some(until) => GetConfirmedSignaturesForAddress2Config {
                    before: None,
                    until: Some(until),
                    limit: None,
                    commitment: Some(CommitmentConfig::confirmed()),
                },
            };

            // This is not 100% robust, but it's good enough for now.
            for (i, signature) in rpc_client
                .get_signatures_for_address_with_config(&sdk.core.active_market_key, config)
                .ok()?
                .iter()
                .map(|tx| Signature::from_str(&tx.signature).unwrap())
                .enumerate()
                .rev()
            {
                if i == 0 {
                    until = Some(signature);
                }
                let events = rt
                    .block_on(sdk.parse_events_from_transaction(&signature))
                    .unwrap_or_default();
                event_sender
                    .send(
                        events
                            .iter()
                            .map(|&e| SDKMarketEvent::PhoenixEvent { event: Box::new(e) })
                            .collect::<Vec<_>>(),
                    )
                    .unwrap()
            }
            std::thread::sleep(Duration::from_millis(timeout_ms));
        }
    }
}