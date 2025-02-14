import React from 'react';
import { Link } from 'react-router-dom'
import logo from '../assets/icons/logo.png'
const Header = () => {
	return (
		<div className="bg-white text-xl md:px-2 flex  border-dashed border-b-2 border-gray-100 p-2">
			<Link to="/" className="flex items-center">
				<img src={logo} alt="logo" className="w-8 h-8 mx-4" />
				<h1 className="font-semibold">Coverview</h1>
			</Link>
		</div>
	);
}

export default Header;