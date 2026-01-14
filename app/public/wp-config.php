<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'local' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'root' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          'Vz}]>G]u`4t4%[R_vx}Mdd)/nRQ<|)@{5h61HdCaXr17vLoqMZ8OyUCK g8Q;Npt' );
define( 'SECURE_AUTH_KEY',   'MZ2tzv;RjcPnb!`wL=Q$f~4HM=iOl#.E]YG2w;([6!G05!Fh$T`TQ`GjfLsj8mf%' );
define( 'LOGGED_IN_KEY',     'n5-*aOHy~Hn}H9S%-AUR=|RMZwiOkZW~`wkZb5r}&m*+*bK@qaa-f|c&k}/>fS^_' );
define( 'NONCE_KEY',         ']F(|/$njp=sW|%XBEMmLBT|swURb{<p!%GxKxV*Cxt0$=z)Ln6$j3b~1cK3&>96g' );
define( 'AUTH_SALT',         'obl2p-|gKU20 +W:BkMk:w.N}@HCZp6B<p-6aC>6D]Szf=$%Ccd$il+$i8 xcw:2' );
define( 'SECURE_AUTH_SALT',  'A(5^;LcUkg/U$3O]Q1p6A)YmR($HQlUG&mzV.NSYOs>+9LkflUO:1o.%NEBCR)nY' );
define( 'LOGGED_IN_SALT',    '}jCCMWE(1octF,bFhaOAYKE$3i2Yqr3Yqh^ BK-s=tf4R *`~$uBxBg4494N-)WP' );
define( 'NONCE_SALT',        ']+Z]n*v+#5#>A+[s*Se7$fr^_QEScS Rt0aszCd@]{txbHt5(y_R9hwZ`4c:*@==' );
define( 'WP_CACHE_KEY_SALT', 'I1gpari-g,YiWW*n==@w.f;2eeP9?,?RGzQAQCm&w!8F@WKqr,?Z.;mt;WMun@$B' );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */



/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

define( 'WP_ENVIRONMENT_TYPE', 'local' );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
