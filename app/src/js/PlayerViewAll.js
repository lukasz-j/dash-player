var PlayerView = React.createClass({
    displayName: "PlayerView",
    render: function () {
        return (
            React.createElement("div", {className: "container"},
                React.createElement(SourceLoadView, null),

                React.createElement(PlayerControllerPanel, null),

                React.createElement(DebugInfoPanel, null)
            )
        );
    }
});

var SourceLoadView = React.createClass({
    displayName: "SourceLoadView",
    getInitialState: function () {
        return {
            videoSource: 'mpd'
        }
    },

    corsShouldBeEnabledAlert: function () {
        if (this.state.videoSource === 'youtube') {
            return (
                React.createElement("div", {className: "alert alert-warning", role: "alert"},
                    React.createElement("strong", null, "Warning!"), " You need browser plugin installed which change CORS header in HTTP" + ' ' +
                    "responses to allow proper streaming from YouTube.  ",
                    React.createElement("a", {
                        href: "https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi",
                        className: "alert-link"
                    }, "Plugin for Chrome")
                )
            );
        } else {
            return '';
        }
    },

    onVideoSourceChanged: function (event) {
        this.setState({videoSource: event.target.value});
    },

    loadVideoSource: function (event) {
        var sourceURL = React.findDOMNode(this.refs.sourceURL).value;
        dashPlayer.load(sourceURL, this.state.videoSource === 'youtube');
    },

    getSourcePlaceholder: function () {
        if (this.state.videoSource === "youtube") {
            return "YouTube movie URL";
        } else {
            return "MPD file URL";
        }
    },

    render: function () {
        return (
            React.createElement("div", null,
                React.createElement("div", {className: "row sourceLoadView"},
                    React.createElement("div", {className: "col-md-2 sourceSelect"},
                        React.createElement("select", {
                                className: "form-control", id: "sourceType", value: this.state.videoSource,
                                onChange: this.onVideoSourceChanged
                            },
                            React.createElement("option", {value: "mpd"}, "MPD file"),
                            React.createElement("option", {value: "youtube"}, "YouTube")
                        )
                    ),

                    React.createElement("div", {className: "col-md-10 sourceInput"},
                        React.createElement("div", {className: "input-group"},
                            React.createElement("input", {
                                type: "text", className: "form-control", ref: "sourceURL",
                                placeholder: this.getSourcePlaceholder()
                            }),
                            React.createElement("span", {className: "input-group-btn"},
                                React.createElement("button", {
                                        className: "btn btn-primary",
                                        type: "button",
                                        onClick: this.loadVideoSource
                                    },
                                    "Load"
                                )
                            )
                        )
                    )
                ),
                React.createElement("div", {className: "row"},
                    this.corsShouldBeEnabledAlert()
                )
            )
        );
    }
});

var PropertyElement = React.createClass({
    displayName: "PropertyElement",
    render: function () {
        return (
            React.createElement("div", null, this.props.name, " : ", this.props.value, " ")
        )
    }
});


var DebugInfoPanel = React.createClass({
    displayName: "DebugInfoPanel",

    getInitialState: function () {
        return {
            isLogTabActive: false,
            waitingLogs: 0
        };
    },

    onLogMessageAppended: function () {
        this.setState({waitingLogs: this.state.waitingLogs + 1});
    },

    onChangedTabToLogs: function () {
        this.setState({isLogTabActive: true, waitingLogs: 0});
    },

    onChangedTabToRepresentation: function () {
        this.setState({isLogTabActive: false});
    },

    render: function () {
        return (
            React.createElement("div", {className: "row"},
                React.createElement("div", {className: "panel panel-info"},
                    React.createElement("div", {className: "panel-heading"},
                        "Debug info"
                    ),
                    React.createElement("div", {className: "panel-body"},
                        React.createElement("ul", {className: "nav nav-pills"},
                            React.createElement("li", {className: "active"},
                                React.createElement("a", {
                                    "data-toggle": "pill", href: "#representations",
                                    onClick: this.onChangedTabToRepresentation
                                }, "Representations")
                            ),
                            React.createElement("li", null,
                                React.createElement("a", {
                                        "data-toggle": "pill",
                                        href: "#logs",
                                        onClick: this.onChangedTabToLogs
                                    }, "Logs",
                                    !this.state.isLogTabActive && this.state.waitingLogs > 0 ?
                                        React.createElement("span", {
                                            ref: "log-span",
                                            className: "badge"
                                        }, this.state.waitingLogs) : null)
                            )
                        ),

                        React.createElement("div", {className: "tab-content"},
                            React.createElement(RepresentationsContainer, null),
                            React.createElement(LogContainer, {logMessageAddedCallback: this.onLogMessageAppended})
                        )
                    )
                )
            )
        );
    }
});


var RepresentationsContainer = React.createClass({
    displayName: "RepresentationsContainer",
    getInitialState: function () {
        return {
            initializedSets: 0,
            videoAdaptationSet: null,
            audioAdaptationSet: null,
            textAdaptationSet: null
        }
    },

    updateAdaptationSetFromEvent: function (event) {
        var adaptationSet = event.value;
        if (adaptationSet.isVideo()) {
            this.setState({videoAdaptationSet: adaptationSet, initializedSets: this.state.initializedSets + 1})
        } else if (adaptationSet.isAudio()) {
            this.setState({audioAdaptationSet: adaptationSet, initializedSets: this.state.initializedSets + 1})
        } else if (adaptationSet.isText()) {
            this.setState({textAdaptationSet: adaptationSet, initializedSets: this.state.initializedSets + 1})
        }
    },

    render: function () {
        eventBus.addEventListener(Dash.event.Events.ADAPTATION_SET_INITIALIZED, this.updateAdaptationSetFromEvent);

        var classNameForChildren = "col-md-" + 12 / this.state.initializedSets;

        return (
            React.createElement("div", {id: "representations", className: "tab-pane fade in active"},
                React.createElement("div", {className: "panel panel-default"},
                    React.createElement("div", {className: "panel-body"},
                        React.createElement("h4", null, "Available adaptation sets and representations for this media"),

                        React.createElement("div", null,
                            this.state.videoAdaptationSet ?
                                React.createElement(RepresentationElement, {
                                    classNameRow: classNameForChildren,
                                    mediaType: Dash.model.MediaType.VIDEO,
                                    totalRepresentationsNumber: this.state.videoAdaptationSet.getRepresentations().length
                                }) : null,
                            this.state.audioAdaptationSet ?
                                React.createElement(RepresentationElement, {
                                    classNameRow: classNameForChildren,
                                    mediaType: Dash.model.MediaType.AUDIO,
                                    totalRepresentationsNumber: this.state.audioAdaptationSet.getRepresentations().length
                                }) : null,
                            this.state.textAdaptationSet ?
                                React.createElement(RepresentationElement, {
                                    classNameRow: classNameForChildren,
                                    mediaType: Dash.model.MediaType.TEXT,
                                    totalRepresentationsNumber: this.state.textAdaptationSet.getRepresentations().length
                                }) : null
                        )
                    )
                )
            )
        )
    }
});

var RepresentationElement = React.createClass({
    displayName: "RepresentationElement",
    getInitialState: function () {
        return {
            representationNumber: 0,
            currentSegment: 0
        };
    },

    updateSegmentIndexFromEvent: function (event) {
        if (event.value.mediaType === this.props.mediaType) {
            this.setState({
                currentSegment: event.value.currentSegment,
                maxSegment: event.value.maxSegment
            });
        }
    },

    createSegmentPropertyValue: function () {
        return this.state.currentSegment + "/" + this.state.maxSegment;
    },

    updateRepresentationFromEvent: function (event) {
        var representation = event.value;
        if (representation.getAdaptationSet().getMediaType() === this.props.mediaType) {
            this.setState({
                representationNumber: representation.orderNumber,
                id: representation.getId(),
                mimeType: representation.getMimeType(),
                codecs: representation.getCodecs(),
                bandwidth: representation.getBandwidth(),
                width: representation.getWidth(),
                height: representation.getHeight(),
                frameRate: representation.getFrameRate(),
                audioSamplingRate: representation.getAudioSamplingRate(),
                maxSegment: representation.getSegment().getSegmentURLs().length
            });
        }
    },

    buttonType: {
        LOWER: 0,
        HIGHER: 1
    },

    printRepresentationPropertiesIfInitialized: function () {
        if (this.state.id) {
            return (
                React.createElement("div", null,
                    React.createElement(PropertyElement, {
                        name: "Representation",
                        value: this.state.representationNumber + '/' + this.props.totalRepresentationsNumber
                    }),
                    React.createElement(PropertyElement, {name: "Id", value: this.state.id}),
                    React.createElement(PropertyElement, {name: "Mime", value: this.state.mimeType}),
                    React.createElement(PropertyElement, {name: "Bandwidth", value: this.state.bandwidth + 'bps'}),
                    this.state.frameRate ?
                        React.createElement(PropertyElement, {
                            name: "Frame rate",
                            value: this.state.frameRate + 'fps'
                        }) : null,
                    this.state.height ?
                        React.createElement(PropertyElement, {name: "Height", value: this.state.height}) : null,
                    this.state.width ?
                        React.createElement(PropertyElement, {name: "Width", value: this.state.width}) : null,
                    this.state.audioSamplingRate ?
                        React.createElement(PropertyElement, {
                            name: "Audio sampling rate",
                            value: this.state.audioSamplingRate + 'Hz'
                        }) : null,
                    React.createElement(PropertyElement, {name: "Segments", value: this.createSegmentPropertyValue()})
                )
            );
        } else {
            return '';
        }
    },

    capitalizeFirstLetterOfMediaType: function (mediaTypeName) {
        return mediaTypeName.charAt(0).toUpperCase() + mediaTypeName.slice(1);
    },

    render: function () {
        eventBus.addEventListener(Dash.event.Events.REPRESENTATION_INITIALIZED, this.updateRepresentationFromEvent);
        eventBus.addEventListener(Dash.event.Events.REPRESENTATION_CHANGED, this.updateRepresentationFromEvent);
        eventBus.addEventListener(Dash.event.Events.SEGMENT_DOWNLOADED, this.updateSegmentIndexFromEvent);

        return (
            React.createElement("div", {id: "videoRepr", className: this.props.classNameRow},
                React.createElement("div", {className: "panel panel-default"},
                    React.createElement("div", {className: "panel-body"},
                        React.createElement("h4", null, this.capitalizeFirstLetterOfMediaType(this.props.mediaType.name)),

                        React.createElement("div", null,
                            this.printRepresentationPropertiesIfInitialized()
                        )
                    )
                )
            )
        );
    }
});


var LogContainer = React.createClass({
    displayName: "LogContainer",
    logBufferSize: 1000,

    getInitialState: function () {
        return {logs: []};
    },

    onLog: function (event) {
        var logs = this.state.logs;
        logs.push({level: event.value.level, message: event.value.message});

        if (logs.length > this.logBufferSize) {
            logs.shift();
        }

        this.setState({logs: logs});
        this.props.logMessageAddedCallback();
    },

    componentDidUpdate: function () {
        var logBody = React.findDOMNode(this.refs.logs);
        logBody.scrollTop = logBody.scrollHeight;
    },

    render: function () {
        eventBus.addEventListener(Dash.event.Events.LOG_MESSAGE, this.onLog);

        var logMessages = this.state.logs.map(function (logEntry) {
            return (
                React.createElement("li", {className: "list-group-item"}, React.createElement(LogMessage, {
                    level: logEntry.level,
                    message: logEntry.message
                }))
            )
        });

        return (
            React.createElement("div", {id: "logs", className: "tab-pane fade"},
                React.createElement("div", {className: "panel panel-default"},
                    React.createElement("div", {className: "panel-body"},
                        React.createElement("h4", null, "Player logs"),

                        React.createElement("div", {ref: "logs", className: "logBody"},
                            React.createElement("ul", {className: "list-group"},
                                logMessages
                            )
                        )
                    )
                )
            )
        );
    }
});

var LogMessage = React.createClass({
    displayName: "LogMessage",
    render: function () {
        switch (this.props.level) {
            case Dash.log.LogLevel.DEBUG:
                return (
                    React.createElement("div", null,
                        React.createElement("span", {className: "label label-default"}, "Debug"), "  ",
                        this.props.message
                    )
                );
            case Dash.log.LogLevel.INFO:
                return (
                    React.createElement("div", null,
                        React.createElement("span", {className: "label label-info"}, "Info"), "  ",
                        this.props.message
                    )
                );
            case Dash.log.LogLevel.WARN:
                return (
                    React.createElement("div", null,
                        React.createElement("span", {className: "label label-warning"}, "Warning"), "  ",
                        this.props.message
                    )
                );
            case Dash.log.LogLevel.ERROR:
                return (
                    React.createElement("div", null,
                        React.createElement("span", {className: "label label-danger"}, "Error"), "  ",
                        this.props.message
                    )
                );
        }
    }
});
var PlayerControllerPanel = React.createClass({
    displayName: "PlayerControllerPanel",
    render: function () {
        return (
            React.createElement("div", {className: "row"},
                React.createElement("div", {className: "panel panel-primary"},
                    React.createElement("div", {className: "panel-heading"},
                        "Player controller"
                    ),
                    React.createElement("div", {className: "panel-body"},
                        React.createElement(VideoMainView, null),
                        React.createElement(VideoControlContainer, null)
                    )
                )
            )
        )
    }
});


var VideoMainView = React.createClass({
    displayName: "VideoMainView",
    render: function () {
        return (
            React.createElement("div", {className: "col-md-8"},
                React.createElement("video", {id: "dashVideoElement", width: "100%", height: "100%", controls: true})
            )
        )
    }
});

var VideoControlContainer = React.createClass({
    displayName: "VideoControlContainer",
    render: function () {
        return (
            React.createElement("div", {className: "col-md-4"},
                React.createElement("ul", {className: "list-group"},
                    React.createElement(MpdDetailsView, null),
                    React.createElement("li", {className: "list-group-item"}, React.createElement(AdaptationControlView, null)),
                    React.createElement("li", {className: "list-group-item"}, React.createElement(QualityControlView, {
                        mediaType: Dash.model.MediaType.VIDEO
                    })),
                    React.createElement("li", {className: "list-group-item"}, React.createElement(QualityControlView, {
                        mediaType: Dash.model.MediaType.AUDIO
                    }))
                )
            )
        )
    }
});

var AdaptationControlView = React.createClass({
    displayName: "AdaptationControlView",
    getInitialState: function () {
        return {
            value: 'Off'
        };
    },

    adaptationChanged: function (event) {
        var adaptationValue = event.target.innerHTML;
        this.setState({value: adaptationValue});

        if (adaptationValue === 'Off') {
            dashPlayer.disableAdaptation();
        } else {
            dashPlayer.enableAdaptation(adaptationValue);
        }
    },

    render: function () {
        return (
            React.createElement("div", null,
                React.createElement("span", {id: "adaptationLabel"}, "Adaptation method"), "  ",

                React.createElement("div", {className: "btn-group", role: "group", "aria-label": "adaptationLabel"},
                    React.createElement("button", {
                            className: "btn btn-default", type: "button", disabled: this.state.value === "Off",
                            onClick: this.adaptationChanged
                        }, "Off"
                    ),
                    React.createElement("button", {
                            className: "btn btn-default", type: "button", disabled: this.state.value === "PID",
                            onClick: this.adaptationChanged
                        }, "PID"
                    ),
                    React.createElement("button", {
                            className: "btn btn-default", type: "button", disabled: this.state.value === "Fuzzy",
                            onClick: this.adaptationChanged
                        }, "Fuzzy"
                    )
                )
            )
        );
    }
});


var QualityControlView = React.createClass({
    displayName: "QualityControlView",

    getInitialState: function () {
        return {
            representations: [],
            chosen: null,
            updating: true
        };
    },

    getRepresentationIdByShortName: function (name) {
        for (var i = 0; i < this.state.representations.length; i += 1) {
            if (this.state.representations[i].name === name) {
                return this.state.representations[i].id;
            }
        }
    },

    changeRepresentation: function (event) {
        event.preventDefault();

        var representationName = event.target.innerHTML,
            representationId = this.getRepresentationIdByShortName(representationName);

        React.findDOMNode(this.refs.dropDownButton).innerHTML = "Changing...";
        this.setState({updating: true});
        dashPlayer.changeRepresentation(this.props.mediaType, representationId);
    },

    onAdaptationSetInitialized: function (event) {
        var adaptationSet = event.value;
        if (adaptationSet.getMediaType() === this.props.mediaType) {
            var representations = adaptationSet.getRepresentations().map(function (element) {
                return {id: element.getId(), name: element.toShortForm()};
            });
            this.setState({representations: representations});
        }
    },

    onRepresentationChanged: function (event) {
        var representation = event.value;
        if (representation.getAdaptationSet().getMediaType() === this.props.mediaType) {
            React.findDOMNode(this.refs.dropDownButton).innerHTML = representation.toShortForm();
            this.setState({updating: false, chosen: representation.toShortForm()});
        }
    },

    getTitle: function () {
        switch (this.props.mediaType) {
            case Dash.model.MediaType.VIDEO:
                return "Video representation";
            case Dash.model.MediaType.AUDIO:
                return "Audio representation";
            case Dash.model.MediaType.TEXT:
                return "Text representation";
        }
    },

    getOptions: function () {
        if (this.state.representations.length <= 0) {
            return '';
        } else {
            var self = this;
            return this.state.representations.map(function (representation) {
                return React.createElement("li", {
                        className: self.state.updating || representation.name === self.state.chosen ? "disabled" : ""
                    },
                    React.createElement("a", {href: "#", onClick: self.changeRepresentation}, representation.name)
                )
            });
        }
    },

    render: function () {
        eventBus.addEventListener(Dash.event.Events.REPRESENTATION_INITIALIZED, this.onRepresentationChanged);
        eventBus.addEventListener(Dash.event.Events.REPRESENTATION_CHANGED, this.onRepresentationChanged);
        eventBus.addEventListener(Dash.event.Events.ADAPTATION_SET_INITIALIZED, this.onAdaptationSetInitialized);

        return (
            React.createElement("div", null,
                React.createElement("span", null, this.getTitle()), "  ",

                React.createElement("div", {className: "btn-group"},
                    React.createElement("button", {
                            type: "button", ref: "dropDownButton", className: "btn btn-default dropdown-toggle",
                            "data-toggle": "dropdown",
                            "aria-haspopup": "true", "aria-expanded": "false"
                        },
                        "Change",
                        React.createElement("span", {className: "caret"})
                    ),
                    React.createElement("ul", {className: "dropdown-menu"},
                        this.getOptions()
                    )
                )
            )
        );
    }
});

var MpdDetailsView = React.createClass({
    displayName: "MpdDetailsView",
    getInitialState: function () {
        return null;
    },

    adaptationSetsToString: function (adaptationSets) {
        var string = adaptationSets.length.toString();

        if (adaptationSets.length > 0) {
            var adaptationSetsMimes = adaptationSets.map(function (element) {
                return element.getMimeType();
            }).join(', ');

            string += ' (' + adaptationSetsMimes + ')';
        }
        return string;
    },

    updateMpdModelFromEvent: function (event) {
        var mpdModel = event.value,
            videoAdaptationSets = mpdModel.getPeriod().getVideoAdaptationSets(),
            audioAdaptationSets = mpdModel.getPeriod().getAudioAdaptationSets(),
            textAdaptationSets = mpdModel.getPeriod().getTextAdaptationSets();

        this.setState({
            type: mpdModel.getType().name,
            profiles: mpdModel.getProfilesAsString(),
            duration: mpdModel.getMediaPresentationDurationFormatted() + ' s',
            minBuffer: mpdModel.getMinBufferTimeFormatted() + ' s',
            videoSets: this.adaptationSetsToString(videoAdaptationSets),
            audioSets: this.adaptationSetsToString(audioAdaptationSets),
            textSets: this.adaptationSetsToString(textAdaptationSets)
        });
    },

    render: function () {
        eventBus.addEventListener(Dash.event.Events.MPD_LOADED, this.updateMpdModelFromEvent);

        if (this.state) {
            return (
                React.createElement("li", {className: "list-group-item"},
                    React.createElement("div", null,
                        React.createElement("h4", null, "MPD Details"),
                        React.createElement(PropertyElement, {name: "Type", value: this.state.type}),
                        React.createElement(PropertyElement, {name: "Profiles", value: this.state.profiles}),
                        React.createElement(PropertyElement, {name: "Duration", value: this.state.duration}),
                        React.createElement(PropertyElement, {name: "Min buffer", value: this.state.minBuffer}),
                        this.state.videoSets ?
                            React.createElement(PropertyElement, {
                                name: "Video sets",
                                value: this.state.videoSets
                            }) : null,
                        this.state.audioSets ?
                            React.createElement(PropertyElement, {
                                name: "Audio sets",
                                value: this.state.audioSets
                            }) : null,
                        this.state.textSets ?
                            React.createElement(PropertyElement, {name: "Text sets", value: this.state.textSets}) : null
                    )
                )
            )
        } else {
            return (
                React.createElement("div", null)
            );
        }
    }
});