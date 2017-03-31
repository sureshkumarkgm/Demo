class SearchBox extends React.Component{
	constructor(){
		super();
	}


	searchChange(e){
		if(e.target.value.length > 3){
			if(this.timeout){
				clearTimeout(this.timeout)
			}
		 	this.timeout = setTimeout(function () {
		    	this.props.searchTextChange(e.target.value, 0);
		    }.bind(this), 1000);
		}else if(e.target.value.length == 0){
			this.props.searchTextChange(e.target.value, 0);
		}
	}
	render(){
		return(<div className="search-box"> 
				  <div></div>
				  <input className="search-input" type="text" value={this.props.searchText} 
				  	placeholder="Start typing to search..."	onChange={this.searchChange.bind(this)}/>
			  </div>)
	}
}

class ImageContainer extends React.Component{
	constructor(){
		super();

		this.state = {
			showPin : false,
			Editable: false
		}
	}

	_showPin(){
		this.setState({showPin: true});
	}

	_hidePin(){
		this.setState({showPin: false});	
	}

	_editImage(){
		this.setState({Editable: true, showPin: false});
	}


	_pinImage(e,key){
		this.setState({
			Editable: false
		});	
	}

	render(){
		
		let user;
		let pin = '';
		let image_name = <div  className='image-name'>{this.props.name}</div>;
		if(this.state.Editable){
			image_name = <input className="image-name-input" value={this.props.name} placeholder="Enter name" onBlur={this._pinImage.bind(this)}/>
		}
		
		if(this.props.user == ''){
			user = <div className="user-container">
		         	<p className="posted-user">Unknown user</p>
	         	 </div>
		}else{
			user = <div className="user-container">
		         	<img className="user-icon" src="images/user_icon.svg"/>
		         	<p className="posted-user">{this.props.user}</p>
	         	 </div>
		}


		if(this.state.showPin){
			pin = <div className="pin" onClick={this._editImage.bind(this)}>
				 	<div>
				 		<img src="images/add_pin.svg"/>
				 	</div>
			 		<div>Pin</div>
				 </div>
		}else{
			pin = ''
		}
		return(
			
		 <li key={this.props.key} className="image-list-item" onMouseEnter={this._showPin.bind(this)} onMouseLeave={this._hidePin.bind(this)}> 
			 {pin}
		     <article key={this.props.key}>
		       <header className="image-header" key={this.props.key}>
		         {image_name}
		       </header>
		       <div className="content" key={this.props.key}>
		         <figure key={this.props.key}>
		           <img src={this.props.url} />
		         </figure>
		         {user}
		       </div>
		     </article>
		 </li>

		)
		
	}
}


class MyApp extends React.Component{
	constructor(){
		super();

		this.state = {
			imageList : [],
			totalImageCount: 0,
			imageStartCount: 0,
			searchText : '',
			loader: false
		}
		this._loadImages = this._loadImages.bind(this);
	}
	

	_getImages(value, start){
		
		this.setState({loader: true});
		$.ajax({
			type: 'GET',
			url: 'http://api.giphy.com/v1/gifs/search',
			data: {
				q: value,
				api_key: 'dc6zaTOxFJmzC',
				offset: start
			},
			success: (response) => {
				let data = [];
				if(this.state.imageList.count > 0){
					data = this.state.imageList;
				}
				data = data.concat(response.data);
				this.setState({
					imageList: data,
					searchText: value,
					loader: false
				});
			},
			error: function(response){
				alert(response);
			}
		});
	}


	_loadImages(){
		return this.state.imageList.map((image) => {
			return (
				<div><ImageContainer url={image.images.fixed_width.url} name={image.slug} key={image.id} user={image.username} /></div>
			);
		});
	}

	_infiniteScroll(e){
		let scrollHeight = e.target.scrollHeight;
		let contentHeight = e.target.offsetHeight;
		let scrollTop = e.target.scrollTop;

		let start = this.state.imageStartCount + 25;
		
		if((scrollHeight - contentHeight) == scrollTop){
			this._getImages(this.state.searchText, start);
		}
 	}

	_calculatePageHeight(){
		const searchBarHeight = 60;
		let imageListHeight = window.innerHeight - searchBarHeight;
		return ({
			'height' : imageListHeight
		})		
	}

	render(){
		let height = this._calculatePageHeight();
		const comments = this._loadImages();
		let loaderDisplay = {display: 'none'}
		if(this.state.loader){
			loaderDisplay = {display: 'block'}
		}
		return(
			<div className="container-content">
				<SearchBox searchTextChange={this._getImages.bind(this)}/>
				<div className="image-list" style={height} onScroll={this._infiniteScroll.bind(this)}>
					<div className="loader-container">
						<img className="loader-image" style={loaderDisplay} src="images/loader.svg" />
					</div>
					{comments}
				</div>

			</div>
		)
		
	}
}


ReactDOM.render(<MyApp />,document.getElementById('container'));
