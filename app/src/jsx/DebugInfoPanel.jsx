var DebugInfoPanel = React.createClass({

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

    onChangedTabToOther: function () {
        this.setState({isLogTabActive: false});
    },

    render: function () {
        return (
            <div className="row">
                <div className="panel panel-info">
                    <div className="panel-heading">
                        Debug info
                    </div>
                    <div className="panel-body">
                        <ul className="nav nav-pills">
                            <li className="active">
                                <a data-toggle="pill" href="#representations"
                                   onClick={this.onChangedTabToOther}>Representations</a>
                            </li>
                            <li>
                                <a data-toggle="pill" href="#logs" onClick={this.onChangedTabToLogs}>Logs
                                    {!this.state.isLogTabActive && this.state.waitingLogs > 0 ?
                                        <span ref="log-span"
                                              className="badge">{this.state.waitingLogs}</span> : null}</a>
                            </li>
                            <li>
                                <a data-toggle="pill" href="#adaptationDetails"
                                   onClick={this.onChangedTabToOther}>Adaptation</a>
                            </li>
                        </ul>

                        <div className="tab-content">
                            <RepresentationsContainer/>
                            <LogContainer logMessageAddedCallback={this.onLogMessageAppended}/>
                            <AdaptationDetailsContainer/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});


var RepresentationsContainer = React.createClass({
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
            <div id="representations" className="tab-pane fade in active">
                <div className="panel panel-default">
                    <div className="panel-body">
                        <h4>Available adaptation sets and representations for this media</h4>

                        <div>
                            {this.state.videoAdaptationSet ?
                                <RepresentationElement classNameRow={classNameForChildren}
                                                       mediaType={Dash.model.MediaType.VIDEO}
                                                       totalRepresentationsNumber={this.state.videoAdaptationSet.getRepresentations().length}/> : null }
                            {this.state.audioAdaptationSet ?
                                <RepresentationElement classNameRow={classNameForChildren}
                                                       mediaType={Dash.model.MediaType.AUDIO}
                                                       totalRepresentationsNumber={this.state.audioAdaptationSet.getRepresentations().length}/> : null }
                            {this.state.textAdaptationSet ?
                                <RepresentationElement classNameRow={classNameForChildren}
                                                       mediaType={Dash.model.MediaType.TEXT}
                                                       totalRepresentationsNumber={this.state.textAdaptationSet.getRepresentations().length}/> : null }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

var RepresentationElement = React.createClass({
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
                <div>
                    <PropertyElement name="Representation"
                                     value={this.state.representationNumber + '/' + this.props.totalRepresentationsNumber}/>
                    <PropertyElement name="Id" value={this.state.id}/>
                    <PropertyElement name="Mime" value={this.state.mimeType}/>
                    <PropertyElement name="Bandwidth" value={this.state.bandwidth + 'bps'}/>
                    {this.state.frameRate ?
                        <PropertyElement name='Frame rate' value={this.state.frameRate + 'fps'}/> : null}
                    {this.state.height ?
                        <PropertyElement name='Height' value={this.state.height}/> : null}
                    {this.state.width ?
                        <PropertyElement name='Width' value={this.state.width}/> : null}
                    {this.state.audioSamplingRate ?
                        <PropertyElement name='Audio sampling rate'
                                         value={this.state.audioSamplingRate + 'Hz'}/> : null}
                    <PropertyElement name='Segments' value={this.createSegmentPropertyValue()}/>
                </div>
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
            <div id="videoRepr" className={this.props.classNameRow}>
                <div className="panel panel-default">
                    <div className="panel-body">
                        <h4>{this.capitalizeFirstLetterOfMediaType(this.props.mediaType.name)}</h4>

                        <div>
                            {this.printRepresentationPropertiesIfInitialized()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});


var LogContainer = React.createClass({
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
                <li className="list-group-item"><LogMessage level={logEntry.level} message={logEntry.message}/></li>
            )
        });

        return (
            <div id="logs" className="tab-pane fade">
                <div className="panel panel-default">
                    <div className="panel-body">
                        <h4>Player logs</h4>

                        <div ref="logs" className="logBody">
                            <ul className="list-group">
                                {logMessages}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var LogMessage = React.createClass({
    render: function () {
        switch (this.props.level) {
            case Dash.log.LogLevel.DEBUG:
                return (
                    <div >
                        <span className="label label-default">Debug</span> &nbsp;
                        {this.props.message}
                    </div>
                );
            case Dash.log.LogLevel.INFO:
                return (
                    <div>
                        <span className="label label-info">Info</span> &nbsp;
                        {this.props.message}
                    </div>
                );
            case Dash.log.LogLevel.WARN:
                return (
                    <div >
                        <span className="label label-warning">Warning</span> &nbsp;
                        {this.props.message}
                    </div>
                );
            case Dash.log.LogLevel.ERROR:
                return (
                    <div >
                        <span className="label label-danger">Error</span> &nbsp;
                        {this.props.message}
                    </div>
                );
        }
    }
});

var AdaptationDetailsContainer = React.createClass({
    render: function() {
        return (
            <div id="adaptationDetails" className="tab-pane fade">
                <div className="panel panel-default">
                    <div className="panel-body">
                        <h4>Adaptation details</h4>
                    </div>
                </div>
            </div>
        );
    }
});
