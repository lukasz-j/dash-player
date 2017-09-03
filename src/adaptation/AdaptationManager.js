Dash.adaptation.Distractor = {
    BREAKS: 1,
    REPRESENTATION_CHANGES: 2
};

Dash.adaptation.AdaptationManager = function () {
    'use strict';

    var profiles = [],
        activeProfile = -1,
        statsCollector,
        playbackManager,
        representations = {},
        adaptationEngine = null;

    var initEmptyProfile = function(name) {
        return {
            name: name,
            preferredDistractor: Dash.adaptation.Distractor.BREAKS,
            distractorAcceptance: 3,
            includeAmbientLight: true,
            includeAmbientSound: true,
            limitDataOnMobileNetwork: true,
            optimizeBattery: true
        };
    };

    var dispatchUpdateEvent = function() {
        eventBus.dispatchEvent({type: Dash.event.Events.ADAPTATION_PROFILES_UPDATE});
    };

    var dispatchToggleEvent = function(enabled) {
        eventBus.dispatchEvent({type: Dash.event.Events.ADAPTATION_TOGGLE, enabled: enabled});
    };

    var onMpdLoaded = function() {
        representations = {};
    };

    var onAdaptationSetInitialized = function(event) {
        var adaptationSet = event.value;
        var asReps = adaptationSet.getRepresentations();
        var reps = [];
        for (var rep in asReps) {
            reps.push({id: asReps[rep].getId(), bw: asReps[rep].getBandwidth()});
        }
        reps.sort(function(a, b) {
            return a.bw - b.bw;
        });
        representations[adaptationSet.getMediaType().name] = reps;
    };

    eventBus.addEventListener(Dash.event.Events.MPD_LOADED, onMpdLoaded);
    eventBus.addEventListener(Dash.event.Events.ADAPTATION_SET_INITIALIZED, onAdaptationSetInitialized);

    return {
        setPlaybackManager: function(manager) {
            playbackManager = manager;
        },
        getPlaybackManager: function() {
            return playbackManager;
        },
        newProfile: function(name) {
            profiles.push(initEmptyProfile(name));
            dispatchUpdateEvent();
        },
        deleteProfile: function(index) {
            if (profiles[index]) {
                profiles.splice(index, 1);
                dispatchUpdateEvent();
            }
        },
        getProfileList: function() {
            return profiles.map(function(profile) {
                return profile.name;
            });
        },
        getProfile: function(index) {
            return profiles[index];
        },
        exportProfiles: function(stringify) {
            if (stringify || typeof(stringify) === 'undefined')
                return JSON.stringify(profiles);
            else
                return profiles;
        },
        importProfiles: function(data) {
            try {
                var imported = JSON.parse(data);
                // @TODO some error checking
                profiles = profiles.concat(imported);
                dispatchUpdateEvent();
                return true;
            }
            catch (err) {
                return false;
            }
        },
        getActiveProfile: function() {
            return profiles[activeProfile];
        },
        setActiveProfile: function(index) {
            if (!profiles[index]) {
                return false;
            }
            activeProfile = index;
            if (this.isAdapting()) {
                // @TODO restart adaptation engine in better way maybe?
                this.disableAdaptation();
                this.enableAdaptation();
            }
            return true;
        },
        conditionsHolder: Dash.adaptation.PlaybackConditionsHolder(),
        initConditonsHolder: function() {
            this.conditionsHolder.configureThroughputHolders([3, 10, 100]);
        },
        initStatsCollector: function(videoElement, mediaSource) {
            statsCollector = Dash.adaptation.StatsCollector(playbackManager, this, videoElement, mediaSource);
        },
        getStatsCollector: function() {
            return statsCollector;
        },
        enableAdaptation: function() {
            if (adaptationEngine === null) {
                adaptationEngine = Dash.adaptation.AdaptationEngine(this, this.getActiveProfile());
            }
            dispatchToggleEvent(true);
        },
        disableAdaptation: function() {
            if (adaptationEngine) {
                adaptationEngine.detach();
                adaptationEngine = null;
            }
            dispatchToggleEvent(false);
        },
        isAdapting: function() {
            return adaptationEngine !== null;
        },
        getRepresentations: function() {
            return representations;
        }
    };
};
