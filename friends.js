// friends.js — Vriendensysteem & Spiergroep Statistieken via Firebase
// Beheert inloggen, vriendverzoeken, vriendenlijst en het uitwisselen van spiergroep-maxima.

const FriendsManager = {
    user: null,
    userProfile: null,
    friends: [],
    requests: [],
    selectedFriendUid: null,
    selectedFriendStats: null,
    store: null,
    app: null,
    unsubscribers: [],

    init(deps) {
        this.store = deps.store;
        this.app = deps.app;

        const auth = getAuth();
        if (!auth) return;

        auth.onAuthStateChanged(async (user) => {
            this.user = user;
            if (user) {
                try {
                    await this.ensureUserProfile();
                    await this.pushStats();
                    this.listenToRequests();
                    this.listenToFriends();
                } catch (e) {
                    console.error("Fout bij laden Firebase profiel:", e);
                }
            } else {
                this.cleanup();
            }
            if (this.app && this.app.currentView === 'friends') {
                this.app.renderFriends();
            }
        });
    },

    cleanup() {
        this.unsubscribers.forEach(unsub => { try { unsub(); } catch(e){} });
        this.unsubscribers = [];
        this.userProfile = null;
        this.friends = [];
        this.requests = [];
        this.selectedFriendUid = null;
        this.selectedFriendStats = null;
    },

    async signIn() {
        const auth = getAuth();
        if (!auth) throw new Error("Firebase Auth is niet geïnitialiseerd.");
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
        } catch (e) {
            console.error("Inloggen met Google mislukt:", e);
            if (this.app) this.app.showToast("Inloggen mislukt: " + e.message, "error");
        }
    },

    async signOut() {
        const auth = getAuth();
        if (auth) await auth.signOut();
    },

    // Genereert een cryptografisch veilige, niet-raadbare vrienden-code (bijv. GF-7K9M-2X8P-W4N3)
    generateFriendCode() {
        const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 duidelijke, niet-verwarrende tekens
        const bytes = new Uint8Array(12);
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(bytes);
        } else {
            for (let i = 0; i < 12; i++) bytes[i] = Math.floor(Math.random() * 256);
        }
        let raw = '';
        for (let i = 0; i < 12; i++) {
            raw += charset[bytes[i] % charset.length];
        }
        return `GF-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
    },

    async ensureUserProfile() {
        const db = getDb();
        if (!db || !this.user) return;

        const userRef = db.collection('users').doc(this.user.uid);
        const doc = await userRef.get();

        if (!doc.exists) {
            const friendCode = this.generateFriendCode();
            const newProfile = {
                uid: this.user.uid,
                displayName: this.user.displayName || 'Sporter',
                email: this.user.email || '',
                photoURL: this.user.photoURL || '',
                friendCode: friendCode,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            };
            await userRef.set(newProfile, { merge: true });
            this.userProfile = newProfile;
        } else {
            this.userProfile = doc.data();
            // Zorg dat friendCode altijd de nieuwe lange cryptografische variant gebruikt (GF-XXXX-YYYY-ZZZZ)
            if (!this.userProfile.friendCode || !this.userProfile.friendCode.startsWith('GF-') || this.userProfile.friendCode.length < 15) {
                const newFriendCode = this.generateFriendCode();
                await userRef.update({ friendCode: newFriendCode });
                this.userProfile.friendCode = newFriendCode;
            }
            await userRef.update({ lastActive: firebase.firestore.FieldValue.serverTimestamp() });
        }
    },

    // Berekent per-oefening maxima per spiergroep en pusht naar Firestore
    async pushStats() {
        const db = getDb();
        if (!db || !this.user || !this.app) return;

        const exercisesByGroup = this.app.calculateExerciseMaxesByMuscleGroup();
        const totalWorkouts = this.store.logs ? this.store.logs.length : 0;
        const weekStreak = this.app.calculateStreak ? this.app.calculateStreak() : 0;

        // Format: { muscleGroups: { chest: { exercises: [...] }, back: { exercises: [...] } } }
        const muscleGroups = {};
        for (const mg in exercisesByGroup) {
            muscleGroups[mg] = { exercises: exercisesByGroup[mg] };
        }

        const statsData = {
            lastUpdated: new Date().toISOString(),
            totalWorkouts: totalWorkouts,
            weekStreak: weekStreak,
            muscleGroups: muscleGroups
        };

        await db.collection('users').doc(this.user.uid).update({
            stats: statsData,
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
        });

        if (this.userProfile) {
            this.userProfile.stats = statsData;
        }
    },


    // Luister naar binnenkomende vriendverzoeken
    listenToRequests() {
        const db = getDb();
        if (!db || !this.user) return;

        const unsub = db.collection('friendRequests')
            .where('toUid', '==', this.user.uid)
            .where('status', '==', 'pending')
            .onSnapshot(snapshot => {
                this.requests = [];
                snapshot.forEach(doc => {
                    this.requests.push({ id: doc.id, ...doc.data() });
                });
                if (this.app && this.app.currentView === 'friends') {
                    this.app.renderFriends();
                }
            }, err => console.warn("Requests listener error:", err));

        this.unsubscribers.push(unsub);
    },

    // Luister naar de vriendenlijst van de gebruiker
    listenToFriends() {
        const db = getDb();
        if (!db || !this.user) return;

        const unsub = db.collection('users').doc(this.user.uid).collection('friends')
            .onSnapshot(async snapshot => {
                const friendDocs = [];
                snapshot.forEach(doc => friendDocs.push({ uid: doc.id, ...doc.data() }));

                // Voor elke vriend het publieke profiel (met de meest recente stats) ophalen
                const friendsWithStats = await Promise.all(friendDocs.map(async f => {
                    try {
                        const userDoc = await db.collection('users').doc(f.uid).get();
                        if (userDoc.exists) {
                            const uData = userDoc.data();
                            return {
                                ...f,
                                displayName: uData.displayName || f.displayName,
                                photoURL: uData.photoURL || f.photoURL,
                                friendCode: uData.friendCode || f.friendCode,
                                stats: uData.stats || null,
                                lastActive: uData.lastActive || null
                            };
                        }
                    } catch (e) {}
                    return f;
                }));

                this.friends = friendsWithStats;

                // Als er nog geen vriend geselecteerd is maar er zijn wel vrienden, selecteer de eerste
                if (!this.selectedFriendUid && this.friends.length > 0) {
                    this.selectedFriendUid = this.friends[0].uid;
                }

                if (this.app && this.app.currentView === 'friends') {
                    this.app.renderFriends();
                }
            }, err => console.warn("Friends listener error:", err));

        this.unsubscribers.push(unsub);
    },

    // Stuur een vriendverzoek via een vrienden-code
    async sendFriendRequest(friendCodeInput) {
        const db = getDb();
        if (!db || !this.user) throw new Error("Je moet ingelogd zijn.");

        const rawInput = (friendCodeInput || '').trim().toUpperCase();
        if (!rawInput) throw new Error("Vul een geldige vrienden-code in.");

        // Formatteer flexibel: verwerk 'GF7K9M2X8PW4N3', '7K9M2X8PW4N3', of 'GF-7K9M-2X8P-W4N3'
        const cleanChars = rawInput.replace(/[^A-Z0-9]/g, '');
        let targetCode = rawInput;
        if (cleanChars.startsWith('GF') && cleanChars.length === 14) {
            const body = cleanChars.slice(2);
            targetCode = `GF-${body.slice(0,4)}-${body.slice(4,8)}-${body.slice(8,12)}`;
        } else if (cleanChars.length === 12) {
            targetCode = `GF-${cleanChars.slice(0,4)}-${cleanChars.slice(4,8)}-${cleanChars.slice(8,12)}`;
        }

        if (this.userProfile && (this.userProfile.friendCode === targetCode || this.userProfile.friendCode === rawInput)) {
            throw new Error("Je kunt niet jezelf als vriend toevoegen.");
        }

        // Zoek gebruiker met deze friendCode (zoek op geformatteerd én raw)
        let query = await db.collection('users').where('friendCode', '==', targetCode).limit(1).get();
        if (query.empty) {
            query = await db.collection('users').where('friendCode', '==', rawInput).limit(1).get();
        }
        if (query.empty) {
            throw new Error(`Geen gebruiker gevonden met code '${targetCode}'. Controleer de code.`);
        }

        const targetUserDoc = query.docs[0];
        const targetUser = targetUserDoc.data();

        // Controleer of jullie al vrienden zijn
        const existingFriendDoc = await db.collection('users').doc(this.user.uid).collection('friends').doc(targetUser.uid).get();
        if (existingFriendDoc.exists) {
            throw new Error(`Je bent al vrienden met ${targetUser.displayName}.`);
        }

        // Controleer of er al een openstaand verzoek is
        const pendingQuery = await db.collection('friendRequests')
            .where('fromUid', '==', this.user.uid)
            .where('toUid', '==', targetUser.uid)
            .where('status', '==', 'pending')
            .limit(1).get();

        if (!pendingQuery.empty) {
            throw new Error(`Er loopt al een verzoek naar ${targetUser.displayName}.`);
        }

        // Maak het verzoek aan
        await db.collection('friendRequests').add({
            fromUid: this.user.uid,
            fromName: this.userProfile ? this.userProfile.displayName : (this.user.displayName || 'Sporter'),
            fromPhoto: this.user.photoURL || '',
            toUid: targetUser.uid,
            toName: targetUser.displayName,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return targetUser.displayName;
    },

    // Accepteer een vriendverzoek
    async acceptFriendRequest(requestId) {
        const db = getDb();
        if (!db || !this.user) return;

        const reqRef = db.collection('friendRequests').doc(requestId);
        const reqDoc = await reqRef.get();
        if (!reqDoc.exists) return;

        const reqData = reqDoc.data();
        const fromUid = reqData.fromUid;

        // Haal profielen op van beide gebruikers
        const fromUserDoc = await db.collection('users').doc(fromUid).get();
        const fromUserData = fromUserDoc.exists ? fromUserDoc.data() : { displayName: reqData.fromName };

        // 1. Maak vriendschap in eigen collectie
        await db.collection('users').doc(this.user.uid).collection('friends').doc(fromUid).set({
            uid: fromUid,
            displayName: fromUserData.displayName || 'Vriend',
            photoURL: fromUserData.photoURL || '',
            friendCode: fromUserData.friendCode || '',
            since: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 2. Maak vriendschap in de collectie van de afzender
        await db.collection('users').doc(fromUid).collection('friends').doc(this.user.uid).set({
            uid: this.user.uid,
            displayName: this.userProfile ? this.userProfile.displayName : (this.user.displayName || 'Vriend'),
            photoURL: this.user.photoURL || '',
            friendCode: this.userProfile ? this.userProfile.friendCode : '',
            since: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 3. Verzoek bijwerken naar accepted
        await reqRef.update({ status: 'accepted' });
    },

    // Weiger een vriendverzoek
    async rejectFriendRequest(requestId) {
        const db = getDb();
        if (!db) return;
        await db.collection('friendRequests').doc(requestId).delete();
    },

    // Verwijdereen vriend
    async removeFriend(friendUid) {
        const db = getDb();
        if (!db || !this.user) return;

        await db.collection('users').doc(this.user.uid).collection('friends').doc(friendUid).delete();
        await db.collection('users').doc(friendUid).collection('friends').doc(this.user.uid).delete();

        if (this.selectedFriendUid === friendUid) {
            this.selectedFriendUid = this.friends.length > 0 ? this.friends[0].uid : null;
        }
    }
};

// Export voor testen (Node/jest); in de browser is FriendsManager een top-level binding
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FriendsManager };
}
