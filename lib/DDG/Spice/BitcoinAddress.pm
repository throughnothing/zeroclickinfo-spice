package DDG::Spice::Bitcoin;

use DDG::Spice;

primary_example_queries '17WoQGy2qctLbK9TuGMW4UfJzMiDfEMTTN';
secondary_example_queries 'bitcoin 17WoQGy2qctLbK9TuGMW4UfJzMiDfEMTTN',
description 'Get Bitcoin Address Info'
name 'BitcoinAddress';
source 'http://blockchain.info';
code_url 'https://github.com/duckduckgo/zeroclickinfo-spice/blob/master/lib/DDG/Spice/BitcoinAddress.pm';
topics 'economy_and_finance';
category 'conversions'; # TODO

attribution github => [qw(https://github.com/throughnothing throughnothing)],

spice to => 'http://blockchain.info/address/$1?format=json';
spice wrap_jsonp_callback => 1;
spice proxy_cache_valid => '418 1d';

my $valid_chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
triggers query => qr/\b([13][$valid_chars]{26,33})\b/;

handle matches => sub { return $_[1] if $_[1] };

1;

