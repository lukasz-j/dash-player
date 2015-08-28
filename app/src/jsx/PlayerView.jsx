var PlayerView = React.createClass({
    render: function () {
        return (
            <div className="container">
                <SourceLoadView />

                <PlayerControllerPanel />

                <DebugInfoPanel />
            </div>
        );
    }
});

var SourceLoadView = React.createClass({
    getInitialState: function () {
        return {
            videoSource: 'mpd'
        }
    },

    corsShouldBeEnabledAlert: function () {
        if (this.state.videoSource === 'youtube') {
            return (
                <div className="alert alert-warning" role="alert">
                    <strong>Warning!</strong> You need browser plugin installed which change CORS header in HTTP
                    responses to allow proper streaming from YouTube. &nbsp;
                    <a href="https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi"
                       className="alert-link">Plugin for Chrome</a>
                </div>
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
            <div>
                <div className="row sourceLoadView">
                    <div className="col-md-2 sourceSelect">
                        <select className="form-control" id="sourceType" value={this.state.videoSource}
                                onChange={this.onVideoSourceChanged}>
                            <option value="mpd">MPD file</option>
                            <option value="youtube">YouTube</option>
                        </select>
                    </div>

                    <div className="col-md-10 sourceInput">
                        <div className="input-group">
                            <input type="text" className="form-control" ref="sourceURL"
                                   placeholder={this.getSourcePlaceholder()}/>
                                <span className="input-group-btn">
                                    <button className="btn btn-primary" type="button" onClick={this.loadVideoSource}>
                                        Load
                                    </button>
                                </span>
                        </div>
                    </div>
                </div>
                <div className="row">
                    {this.corsShouldBeEnabledAlert()}
                </div>
            </div>
        );
    }
});

var PropertyElement = React.createClass({
    render: function () {
        return (
            <div>{this.props.name} : {this.props.value} </div>
        )
    }
});







