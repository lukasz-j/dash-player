var PolicyConfigurationView = React.createClass({
    render: function () {
        return (
            <div className="policy-configuration">
                <div className="row">
                    <div className="col-md-4 col-sm-6 adaptation-profile-list">
                        <h3>Stored profiles</h3>
                        <select multiple={true}>
                            <option value="0">Marek</option>
                            <option value="0">Staszek</option>
                        </select>
                        <div className="row">
                        <div className="col-md-3 col-sm-6">
                        <button className="btn btn-primary profile-list-button" type="button">New</button>
                </div>
                        <div className="col-md-3 col-sm-6">
                        <button className="btn btn-danger" type="button">Delete</button>
                </div>
                        <div className="col-md-3 col-sm-6">
                        <button className="btn" type="button">Import</button>
                </div>
                        <div className="col-md-3 col-sm-6">
                        <button className="btn" type="button">Export</button>
                </div>
                        </div>
                    </div>
                    <div className="col-md-8 col-sm-6 adaptation-profile-settings">
                        <h3>Profile settings</h3>
                        <div className="row">
                        <div className="col-md-4 col-sm-6"><label htmlFor="adaptation-tolerate-pauses">How can you tolerate pauses in playback?</label></div>
                        <div className="col-md-8 col-sm-6"><input id="adaptation-tolerate-pauses" type="range" min="0" max="10"/></div>
                        </div>
                        <div className="row">
                        <div className="col-md-4 col-sm-6"><label htmlFor="adaptation-tolerate-changes">How frequent changes of quality can you tolerate?</label></div>
                        <div className="col-md-8 col-sm-6"><input id="adaptation-tolerate-changes" type="range" min="0" max="10"/></div>
                        </div>
                        <div className="row">
                        <div className="col-xs-11"><label htmlFor="adaptation-include-light">Do you allow ambient light level to affect video adaptation?</label></div>
                        <div className="col-xs-1"><input id="adaptation-include-light" type="checkbox"/></div>
                        </div>
                        <div className="row">
                        <div className="col-xs-11"><label htmlFor="adaptation-include-sound">Do you allow ambient sound level to affect audio adaptation?</label></div>
                        <div className="col-xs-1"><input id="adaptation-include-sound" type="checkbox"/></div>
                        </div>
                        <div className="row">
                        <div className="col-xs-11"><label htmlFor="adaptation-include-mobile-saving">Do you want to minimize data usage on mobile network?</label></div>
                        <div className="col-xs-1"><input id="adaptation-include-mobile-saving" type="checkbox"/></div>
                        </div>
                        <div className="row">
                        <div className="col-xs-11"><label htmlFor="adaptation-allow-battery-opt">Do you want us to propose adaptation strategy which allows to watch whole stream with current battery level?</label></div>
                        <div className="col-xs-1"><input id="adaptation-allow-battery-opt" type="checkbox"/></div>
                        </div>
                        <div className="row">
                        <div className="col-md-10 col-sm-8"></div>
                        <div className="col-md-2 col-sm-4">
                        <button className="btn btn-primary" onClick={this.props.wrapper.goToPlayer}>Done</button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var ExternalConditionsEmulator = React.createClass({
    getInitialState: function() {
        return {visible: false};
    },
    render: function() {
        var classes = 'external-conditions-overlay '+(this.state.visible ? 'visible' : '');
        var intensityOptions = [];
        for (i=0; i<=10; i++) {
            intensityOptions.push(<option value={i*10}>{i*10}%</option>);
        }
        return (
            <div className={classes}>
    <span className="visibility-toggle" onClick={this.toggleVisibility}
        data-toggle="tooltip" data-placement="left" title="External conditions emulation"
    >&laquo;</span>
            <div className="panel panel-default">
              <div className="panel-heading">
              External conditions emulation
                <span className="visibility-close" onClick={this.toggleVisibility}>&times;</span>
              </div>
            <div className="panel-body">
            <p>
              This panel is used in pure web browser environments to provide
              adaptation engine with information about outside world. In mobile
              application this will be supplied by enclosing app. To be used
              for testing purposes.
              </p>
              <div className="form-group">
                <label for="ece-network">Current network type</label>
                <select id="ece-network" className="form-control">
                <option>Wi-Fi/Cable</option>
                <option>Mobile</option>
                </select>
              </div>
              <div className="form-group">
                <label for="ece-ambient-light">Ambient light intensity</label>
                <select id="ece-ambient-light" className="form-control">
                    {intensityOptions}
                </select>
              </div>
              <p>&hellip; and others if applicable</p>
            </div>
            </div>
            </div>
        );
    },
    componentDidMount: function() {
        $('[data-toggle="tooltip"]').tooltip();
    },
    toggleVisibility: function() {
        this.setState({visible: !this.state.visible});
    }
});
