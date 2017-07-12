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
                        <div className="col-md-4 col-sm-6">How can you tolerate pauses in playback?</div>
                        <div className="col-md-8 col-sm-6"><input type="range" min="0" max="10"/></div>
                        </div>
                        <div className="row">
                        <div className="col-md-4 col-sm-6">How frequent changes of quality can you tolerate?</div>
                        <div className="col-md-8 col-sm-6"><input type="range" min="0" max="10"/></div>
                        </div>
                        <div className="row">
                        <div className="col-xs-11">Do you allow ambient light level to affect video adaptation?</div>
                        <div className="col-xs-1"><input type="checkbox"/></div>
                        </div>
                        <div className="row">
                        <div className="col-xs-11">Do you allow ambient sound level to affect audio adaptation?</div>
                        <div className="col-xs-1"><input type="checkbox"/></div>
                        </div>
                        <div className="row">
                        <div className="col-xs-11">Do you want to minimize data usage on mobile network?</div>
                        <div className="col-xs-1"><input type="checkbox"/></div>
                        </div>
                        <div className="row">
                        <div className="col-xs-11">Do you want us to propose adaptation strategy which allows to watch whole stream with current battery level?</div>
                        <div className="col-xs-1"><input type="checkbox"/></div>
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
