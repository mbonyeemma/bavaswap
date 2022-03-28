import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client';
import * as StellarSdk from 'stellar-sdk';
import { ReactSession } from 'react-client-session';
import QRCodeModal from "@walletconnect/qrcode-modal";


const METADATA = {
    name: 'Galaxe',
    description: 'Galaxy is the best',
    url: 'https://galaxe.io/',
    icons: ['https://galaxe.io/assets/images/galaxe.svg'],
};

const STELLAR_METHODS = {
    SIGN: 'stellar_signAndSubmitXDR',
};
const TESTNET = 'stellar:testnet';
const PUBNET = 'stellar:pubnet';

export default class WalletConnectService {
    constructor() {
        this.driver = null;
        this.appMeta = null;
        this.client = null;
        this.session = null;

        this.isPairCreated = false;
    }

    async initWalletConnect() {
        if (this.client) {
            ReactSession.set("client", this.client)

            return null
        }

        this.client = await WalletConnectClient.init({
            // logger: 'debug',
            projectId: "98c25ab644dc9711169f24976d11e160",
            relayUrl: 'wss://relay.walletconnect.org',
        });
        ReactSession.set("client", this.client)


        // there is a problem with updating the states in wallet connect, a small timeout solves this problem
        // TODO delete this when it is fixed in the library
        await new Promise(resolve => { setTimeout(() => resolve(), 500); });
        console.log("step0", this.client.session.topics.length)

        this.listenWalletConnectEvents();
        console.log("step1", this.client.session.topics.length)

        if (!this.client.session.topics.length) {
            return null;
        }

        this.session = await this.client.session.get(this.client.session.topics[0]);

        // eslint-disable-next-line no-unused-vars
        const [chain, reference, publicKey] = this.session.state.accounts[0].split(':');
        this.appMeta = this.session.peer.metadata;
        const keypair = StellarSdk.Keypair.fromPublicKey(publicKey);


        console.log("logged in", publicKey)
        ReactSession.set("publicKey", publicKey)
        ReactSession.set("session", this.session)
        return 'logged';

    }

    listenWalletConnectEvents() {
        this.client.on(CLIENT_EVENTS.pairing.created, res => this.onPairCreated(res));

        this.client.on(CLIENT_EVENTS.pairing.updated, res => this.onPairUpdated(res));

        this.client.on(CLIENT_EVENTS.session.deleted, session => this.onSessionDeleted(session));

        this.client.on(CLIENT_EVENTS.pairing.proposal, proposal => this.onPairProposal(proposal));
    }

    async onPairCreated(res) {
        this.appMeta = res.state.metadata;
        this.isPairCreated = true;
    }

    onPairUpdated(res) {
        this.appMeta = res.state.metadata;

        if (this.isPairCreated) {
            this.isPairCreated = false;
        }
    }

    onSessionDeleted(session) {
        if (this.session && this.session.topic === session.topic) {
            this.session = null;
            this.appMeta = null;
            ReactSession.set("publicKey", "")
            ReactSession.set("uri", undefined)
        }
    }

    async onPairProposal(proposal) {
        console.log("here now")
        const { uri } = proposal.signal.params;
        console.log("uri", uri)
        ReactSession.set("uri", uri)
        QRCodeModal.open(uri, () => {
            console.log("EVENT", "QR Code Modal closed");
        });


    }

    async login() {
        console.log("beggining login ")

        const result = await this.initWalletConnect();
        console.log("login 2", result)

        if (result === 'logged') {
            return;
        }



        console.log(this.client.pairing.topics.length)



        if (this.client.pairing.topics.length > 3) {
            const deletePromises = [];
            this.client.pairing.topics.slice(0, -3).forEach(topic => {
                deletePromises.push(this.client.pairing.delete({ topic }));
            });

            await Promise.all(deletePromises);
        }

        if (this.client.pairing.topics.length) {
            this.client.pairing.values.reverse()
            this.connect()
            this.deletePairing(this.client.pairing.topics)
            return;
        }

        await this.connect();
    }


    async deletePairing(topic) {
        await this.client.pairing.delete({ topic });
    }

    async connect(pairing) {

        if (pairing) {

        }

        try {
            this.session = await this.client.connect({
                metadata: METADATA,
                pairing: pairing ? { topic: pairing.topic } : undefined,
                permissions: {
                    blockchain: {
                        chains: [PUBNET],
                    },
                    jsonrpc: {
                        methods: ["stellar_signAndSubmitXDR"]
                    },
                },
            });
            ReactSession.set("session", this.session)

        } catch (e) {
            if (this.session) {
                return Promise.resolve({ status: 'cancel' });
            }
            this.appMeta = null;
            if (e.message === 'cancelled') {
                return Promise.resolve({ status: 'cancel' });
            }
            const errorMessage = e.message === 'Session not approved' ?
                'Connection canceled by the user' :
                e.message;
            //this.driver.toastService.error('Connection unsuccessful', errorMessage);
            return "cancel"
        }

        this.appMeta = this.session.peer.metadata;

        // eslint-disable-next-line no-unused-vars
        const [chain, reference, publicKey] = this.session.state.accounts[0].split(':');
        const keypair = StellarSdk.Keypair.fromPublicKey(publicKey);
        ReactSession.set("publicKey", publicKey)

        if (pairing) {
            this.client.pairing.settled.update(pairing.topic, {
                state: {
                    metadata: this.appMeta,
                },
            });
        }

    }

    async logout() {
        if (this.session) {
            await this.client.disconnect({
                topic: this.session.topic,
                reason: 'log out',
            });
        }
        this.onSessionDeleted(this.session)
        console.log("logout success")
    }

    async signTx(xdr) {
        this.client = await ReactSession.get("client")
        this.session = await ReactSession.get("session")

        console.log(this.client)
        console.log("step00", xdr)



        console.log("step00", this.client)

        this.appMeta = METADATA
        //const xdr = tx.toEnvelope().toXDR('base64');

        this.client.request({
            topic: this.session.topic,
            chainId: PUBNET,
            request: {
                jsonrpc: "2.0",
                method: "stellar_signAndSubmitXDR",
                params: {
                    xdr
                }

            },
        }).then(result => {
            //refresh screen
            console.log(result)

            return result;
        })
    }



}
